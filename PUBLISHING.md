# Publishing @arzancloud Packages

## Overview

All packages in this monorepo are published to GitHub Packages under the `@arzancloud` scope.

## Packages

| Package | Description | Status |
|---------|-------------|--------|
| `@arzancloud/database` | Database schemas & utilities | ✅ Ready |
| `@arzancloud/auth` | Authentication & authorization | ✅ Ready |
| `@arzancloud/ui` | UI component library | ✅ Ready |
| `@arzancloud/api-client` | API client & React hooks | ✅ Ready |
| `@arzancloud/utils` | Shared utilities | ✅ Ready |
| `@arzancloud/i18n` | Internationalization | ✅ Ready |
| `@arzancloud/modules` | Module system | ✅ Ready |

## Prerequisites

### For CI/CD (GitHub Actions)

The `GITHUB_TOKEN` is automatically available in GitHub Actions and has permissions to publish packages.

### For Local Development

1. Create a GitHub Personal Access Token (PAT) with `read:packages` and `write:packages` scopes
2. Login to GitHub Packages:

```bash
npm login --registry=https://npm.pkg.github.com --scope=@arzancloud
# Username: your-github-username
# Password: your-personal-access-token
# Email: your-email
```

Or add to `~/.npmrc`:

```
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_PAT
@arzancloud:registry=https://npm.pkg.github.com
```

## Publishing

### Automatic (Recommended)

Push a tag starting with `v` to trigger the publish workflow:

```bash
# Update versions in all packages
pnpm version:patch   # 0.1.0 -> 0.1.1
# or
pnpm version:minor   # 0.1.0 -> 0.2.0
# or
pnpm version:major   # 0.1.0 -> 1.0.0

# Commit and tag
git add .
git commit -m "chore: release v0.1.1"
git tag v0.1.1
git push origin main --tags
```

### Manual (GitHub Actions)

1. Go to Actions → Publish Packages
2. Click "Run workflow"
3. Optionally specify version

### Manual (Local)

```bash
# Build all packages first
pnpm build:packages

# Publish all packages
pnpm publish:packages
```

## Installing Packages in Other Projects

1. Add `.npmrc` to the project root:

```
@arzancloud:registry=https://npm.pkg.github.com
```

2. Install packages:

```bash
npm install @arzancloud/database @arzancloud/auth @arzancloud/ui
# or
pnpm add @arzancloud/database @arzancloud/auth @arzancloud/ui
```

## Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

## Troubleshooting

### "401 Unauthorized" when publishing

- Check that your GitHub token has `write:packages` scope
- Verify you're logged in: `npm whoami --registry=https://npm.pkg.github.com`

### "403 Forbidden" when publishing

- The package might already exist with a different owner
- Check repository permissions

### "404 Not Found" when installing

- Ensure you're authenticated: `npm login --registry=https://npm.pkg.github.com`
- Check that the package was published successfully
