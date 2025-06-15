# MPG Calculator

This is the codebase for MPGCalculator.net, a web application for calculating fuel economy and planning road trips.

## Blog Templates

The blog template is located in the `templates/blog` directory. This template is not part of the Next.js build process and won't be included in production builds.

### Creating a New Blog Post

To create a new blog post:

1. Copy the template from `templates/blog/template.tsx` to the appropriate location in the `app/blog` directory.
2. Rename the file to `page.tsx` and place it in a directory that matches the URL slug you want to use.
3. Uncomment and update the import paths at the top of the file to match your new location.
4. Remove the mock component declarations (they're only there for the template).
5. Update the metadata, content, and other elements as needed.

For example, to create a blog post at `/blog/fuel-economy/how-to-improve-mpg`:

```bash
# Create the directory
mkdir -p app/blog/fuel-economy/how-to-improve-mpg

# Copy the template
cp templates/blog/template.tsx app/blog/fuel-economy/how-to-improve-mpg/page.tsx

# Edit the new file
# 1. Update import paths:
#    import '../../blog.css'
#    import ExternalLink from '../../../../components/ExternalLink'
#    etc.
# 2. Remove mock component declarations
# 3. Update metadata, content, etc.
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## License

Copyright © MPGCalculator.net. All rights reserved. 