<#
PowerShell helper to create a GitHub repository and push the current repository using the GitHub CLI `gh`.

Usage:
 - Make sure you have gh installed and are logged in: `gh auth login`.
 - Run this script from the repository root in PowerShell: `./scripts/push_to_github.ps1`

This script will:
 - Ask for a repository name
 - Create the GitHub repo (public or private)
 - Add the remote and push all branches

It does NOT expose credentials. You must be authenticated with `gh` before running.
#>

param(
    [string]$RepoName = $null,
    [switch]$Private
)

function Ensure-GhAvailable {
    $gh = Get-Command gh -ErrorAction SilentlyContinue
    if (-not $gh) {
        Write-Error "GitHub CLI 'gh' not found. Install from https://cli.github.com/ and run 'gh auth login' before using this script."
        exit 1
    }
}

Ensure-GhAvailable

if (-not $RepoName) {
    $RepoName = Read-Host "Enter new GitHub repo name (e.g. pi-service-manager)"
}

if (-not $RepoName) {
    Write-Error "Repository name required."
    exit 1
}

# Ask public/private
if (-not $Private) {
    $choice = Read-Host "Create private repo? (y/N)"
    if ($choice -match '^[yY]') { $isPrivate = $true } else { $isPrivate = $false }
} else {
    $isPrivate = $true
}

# Create remote repo
Write-Host "Creating GitHub repo: $RepoName (private: $isPrivate)"
$createResult = ""
if ($isPrivate) {
    $createResult = gh repo create $RepoName --private --source=. --remote=origin 2>&1
} else {
    $createResult = gh repo create $RepoName --public --source=. --remote=origin 2>&1
}
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to create repo: $createResult"
    exit 1
}

# Add remote and push
# Ensure we have a git repo locally
if (-not (Test-Path .git)) {
    git init
}

# Get the HTTPS URL directly from the created repo
$remoteUrl = "https://github.com/Lumus-0x/$RepoName.git"

# Add origin remote if missing
$existing = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) {
    git remote add origin $remoteUrl
}

Write-Host "Pushing all branches to origin..."

# Configure git user if not set
if (-not (git config --get user.email)) {
    git config --local user.email "$(gh api user --jq .email)"
    git config --local user.name "$(gh api user --jq .name)"
}

# Remove any existing git repos in subdirectories
Get-ChildItem -Path . -Directory -Recurse | Where-Object { Test-Path (Join-Path $_.FullName '.git') } | ForEach-Object {
    Remove-Item -Path (Join-Path $_.FullName '.git') -Recurse -Force
}

git add -A
git commit -m "Initial commit" -q 2>$null
git push -u origin HEAD

if ($LASTEXITCODE -eq 0) {
    Write-Host "Push successful. Repository available at:"
    gh repo view $RepoName --web
} else {
    Write-Error "Push failed. Please check git remote and credentials."
}
