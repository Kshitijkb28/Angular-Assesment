import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: any[] = [];
  categories: any[] = [];
  loading = false;
  error = '';
  success = '';
  showModal = false;
  showBulkUploadModal = false;
  productForm: FormGroup;
  editingProduct: any = null;
  selectedFile: File | null = null;
  bulkUploadFile: File | null = null;
  bulkUploadProgress = '';

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;

  // Filters
  searchTerm = '';
  categoryFilter = '';
  sortBy = 'createdAt';
  sortOrder = 'desc';

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private formBuilder: FormBuilder
  ) {
    this.productForm = this.formBuilder.group({
      name: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      categoryId: ['', Validators.required],
      image: ['']
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (response) => {
        this.categories = response.data;
      },
      error: (err) => {
        console.error('Failed to load categories', err);
      }
    });
  }

  loadProducts(): void {
    this.loading = true;
    const params = {
      page: this.currentPage,
      limit: this.pageSize,
      search: this.searchTerm,
      categoryId: this.categoryFilter,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder
    };

    this.productService.getAllProducts(params).subscribe({
      next: (response) => {
        this.products = response.data;
        this.totalItems = response.pagination.total;
        this.totalPages = response.pagination.totalPages;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.error || 'Failed to load products';
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  onSort(field: string): void {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'asc';
    }
    this.loadProducts();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadProducts();
  }

  openModal(product?: any): void {
    this.editingProduct = product || null;
    if (product) {
      this.productForm.patchValue({
        name: product.name,
        price: product.price,
        categoryId: product.categoryId
      });
    } else {
      this.productForm.reset();
    }
    this.selectedFile = null;
    this.showModal = true;
    this.error = '';
    this.success = '';
  }

  closeModal(): void {
    this.showModal = false;
    this.editingProduct = null;
    this.productForm.reset();
    this.selectedFile = null;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onSubmit(): void {
    if (this.productForm.invalid) return;

    const formData = new FormData();
    formData.append('name', this.productForm.value.name);
    formData.append('price', this.productForm.value.price);
    formData.append('categoryId', this.productForm.value.categoryId);
    
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    if (this.editingProduct) {
      this.productService.updateProduct(this.editingProduct.id, formData).subscribe({
        next: () => {
          this.success = 'Product updated successfully';
          this.closeModal();
          this.loadProducts();
        },
        error: (err) => {
          this.error = err.error?.error || 'Failed to update product';
        }
      });
    } else {
      this.productService.createProduct(formData).subscribe({
        next: () => {
          this.success = 'Product created successfully';
          this.closeModal();
          this.loadProducts();
        },
        error: (err) => {
          this.error = err.error?.error || 'Failed to create product';
        }
      });
    }
  }

  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.success = 'Product deleted successfully';
          this.loadProducts();
        },
        error: (err) => {
          this.error = err.error?.error || 'Failed to delete product';
        }
      });
    }
  }

  openBulkUploadModal(): void {
    this.showBulkUploadModal = true;
    this.bulkUploadFile = null;
    this.bulkUploadProgress = '';
    this.error = '';
  }

  closeBulkUploadModal(): void {
    this.showBulkUploadModal = false;
    this.bulkUploadFile = null;
    this.bulkUploadProgress = '';
  }

  onBulkFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.bulkUploadFile = file;
    }
  }

  onBulkUpload(): void {
    if (!this.bulkUploadFile) {
      this.error = 'Please select a file';
      return;
    }

    this.bulkUploadProgress = 'Uploading...';
    this.productService.bulkUpload(this.bulkUploadFile).subscribe({
      next: (response) => {
        this.bulkUploadProgress = `Upload complete! Success: ${response.summary.success}, Failed: ${response.summary.failed}`;
        this.success = 'Bulk upload completed';
        this.loadProducts();
        setTimeout(() => this.closeBulkUploadModal(), 3000);
      },
      error: (err) => {
        this.error = err.error?.error || 'Bulk upload failed';
        this.bulkUploadProgress = '';
      }
    });
  }

  downloadReport(format: string): void {
    this.productService.generateReport(format).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `products-report.${format}`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.success = 'Report downloaded successfully';
      },
      error: (err) => {
        this.error = 'Failed to generate report';
      }
    });
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  }
}
