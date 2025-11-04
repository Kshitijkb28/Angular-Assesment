import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css']
})
export class CategoryListComponent implements OnInit {
  categories: any[] = [];
  loading = false;
  error = '';
  success = '';
  showModal = false;
  categoryForm: FormGroup;
  editingCategory: any = null;

  constructor(
    private categoryService: CategoryService,
    private formBuilder: FormBuilder
  ) {
    this.categoryForm = this.formBuilder.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.categoryService.getAllCategories().subscribe({
      next: (response) => {
        this.categories = response.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.error || 'Failed to load categories';
        this.loading = false;
      }
    });
  }

  openModal(category?: any): void {
    this.editingCategory = category || null;
    if (category) {
      this.categoryForm.patchValue({ name: category.name });
    } else {
      this.categoryForm.reset();
    }
    this.showModal = true;
    this.error = '';
    this.success = '';
  }

  closeModal(): void {
    this.showModal = false;
    this.editingCategory = null;
    this.categoryForm.reset();
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) return;

    const data = this.categoryForm.value;

    if (this.editingCategory) {
      this.categoryService.updateCategory(this.editingCategory.id, data).subscribe({
        next: () => {
          this.success = 'Category updated successfully';
          this.closeModal();
          this.loadCategories();
        },
        error: (err) => {
          this.error = err.error?.error || 'Failed to update category';
        }
      });
    } else {
      this.categoryService.createCategory(data).subscribe({
        next: () => {
          this.success = 'Category created successfully';
          this.closeModal();
          this.loadCategories();
        },
        error: (err) => {
          this.error = err.error?.error || 'Failed to create category';
        }
      });
    }
  }

  deleteCategory(id: number): void {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.deleteCategory(id).subscribe({
        next: () => {
          this.success = 'Category deleted successfully';
          this.loadCategories();
        },
        error: (err) => {
          this.error = err.error?.error || 'Failed to delete category';
        }
      });
    }
  }
}
