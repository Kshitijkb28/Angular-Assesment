# Bulk Upload Guide

## Category Validation

The bulk upload feature includes **automatic category validation**. Products will only be imported if their category exists in the database.

## Before Bulk Upload

### Step 1: Create Categories First

Before uploading products, ensure you have created the necessary categories:

1. Go to **Categories** page
2. Click **Add Category**
3. Create categories like:
   - Electronics (ID: 1)
   - Furniture (ID: 2)
   - Accessories (ID: 3)
   - etc.

### Step 2: Note Category IDs

After creating categories, note their IDs from the category list table.

## CSV File Format

Your CSV file must have these columns:

```csv
name,price,categoryId,image
Product Name,99.99,1,
Another Product,149.99,2,
```

### Column Details:

- **name** (required): Product name
- **price** (required): Product price (decimal number)
- **categoryId** (required): Must match an existing category ID
- **image** (optional): Image filename (leave empty if none)

## Example CSV

```csv
name,price,categoryId,image
Laptop Dell XPS 15,1299.99,1,
Office Chair Ergonomic,349.99,2,
Water Bottle,19.99,3,
```

## Validation Rules

### ✅ Valid Upload
- Category ID exists in database
- Price is a positive number
- Name is not empty

### ❌ Invalid Upload (Will be skipped)
- Category ID does not exist
- Price is negative or not a number
- Name is empty

## Upload Process

1. **Navigate** to Products page
2. **Click** "Bulk Upload" button
3. **Select** your CSV or XLSX file
4. **Upload** and wait for processing

## Upload Results

After upload completes, you'll see:

```json
{
  "success": true,
  "message": "Bulk upload completed",
  "summary": {
    "total": 20,
    "success": 18,
    "failed": 2
  },
  "errors": [
    {
      "row": 5,
      "error": "Category ID 99 not found"
    },
    {
      "row": 12,
      "error": "Price must be a positive number"
    }
  ]
}
```

## Error Handling

### Common Errors:

1. **"Category ID X not found"**
   - Solution: Create the category first, or update CSV with correct category ID

2. **"Price must be a positive number"**
   - Solution: Ensure price is a valid decimal number (e.g., 99.99)

3. **"Product name is required"**
   - Solution: Ensure name column is not empty

## Tips

- **Test with small file first**: Upload 5-10 products to test
- **Check category IDs**: Always verify category IDs match your database
- **Use Excel**: You can create the file in Excel and save as CSV
- **Batch processing**: Large files are processed in batches of 100
- **Error limit**: Only first 50 errors are shown in response

## Sample Files

Use the provided `sample-bulk-upload.csv` as a template:

1. Open the file
2. Replace with your data
3. Ensure category IDs match your categories
4. Save and upload

## XLSX Support

Both CSV and XLSX (Excel) formats are supported:

- `.csv` - Comma-separated values
- `.xlsx` - Excel workbook
- `.xls` - Legacy Excel format

## Best Practices

1. ✅ Create all categories before bulk upload
2. ✅ Validate your CSV data before upload
3. ✅ Keep category IDs consistent
4. ✅ Use meaningful product names
5. ✅ Test with small batches first
6. ❌ Don't use non-existent category IDs
7. ❌ Don't leave required fields empty
8. ❌ Don't upload files larger than 10MB

## Troubleshooting

### All products failed with "Category not found"

**Solution**: You need to create categories first:
1. Go to Categories page
2. Create at least one category
3. Note the category ID
4. Update your CSV with the correct category ID
5. Try upload again

### Some products succeeded, some failed

**Solution**: Check the error details in the response. Fix the rows with errors and upload them again.

### Upload timeout

**Solution**: The system uses streaming to prevent timeouts, but if you still face issues:
- Split your file into smaller batches (500 products per file)
- Check your network connection
- Ensure database is running properly

---

**Need Help?** Check the main README.md for more documentation.
