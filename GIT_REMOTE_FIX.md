# Fix Git Remote URL

Your GitHub repository has moved to a new location. Follow these steps to update your local repository:

## Quick Fix

Run this command in your terminal:

```bash
git remote set-url origin https://github.com/mekdi-hub/Unibite.git
```

## Verify the Change

Check that the remote URL was updated correctly:

```bash
git remote -v
```

You should see:
```
origin  https://github.com/mekdi-hub/Unibite.git (fetch)
origin  https://github.com/mekdi-hub/Unibite.git (push)
```

## Push Your Changes

Now you can push without the warning:

```bash
git push
```

## What Happened?

GitHub detected that your repository moved from:
- Old: `https://github.com/mekdela-del/Unibite.git`
- New: `https://github.com/mekdi-hub/Unibite.git`

This usually happens when you rename your GitHub username or transfer the repository to a different account.

## Alternative Method (Manual Edit)

If the command doesn't work, you can manually edit the git config:

1. Open `.git/config` file in your project root
2. Find the `[remote "origin"]` section
3. Update the `url` line to: `https://github.com/mekdi-hub/Unibite.git`
4. Save the file

That's it! Your git remote is now pointing to the correct location.
