# Universal Token Counter for Any Project  
# Enhanced version with proper node_modules exclusion
# Usage: .\universal-token-counter.ps1 -Path "C:\your\project" -Detailed

param(
    [string]$Path = ".",
    [string[]]$Include = @('*.ts', '*.js', '*.feature', '*.md', '*.json', '*.yml', '*.yaml'),
    [switch]$Detailed,
    [switch]$IncludeNodeModules = $false
)

Write-Host "🧮 UNIVERSAL TOKEN COUNTER" -ForegroundColor Yellow
Write-Host "==========================" -ForegroundColor Gray
Write-Host ""
Write-Host "📁 Project Path: " -NoNewLine -ForegroundColor Cyan  
Write-Host (Resolve-Path $Path).Path
Write-Host ""

$total = 0
$files = @()
$fileDetails = @()

# Folders to exclude
$excludeFolders = @("node_modules", ".git", "dist", "build", "coverage")

foreach ($pattern in $Include) {
    Write-Host "🔍 Scanning $pattern files..." -ForegroundColor Gray
    $foundFiles = Get-ChildItem -Path $Path -Recurse -Include $pattern -ErrorAction SilentlyContinue
    $files += $foundFiles
}

# Filter out excluded folders unless explicitly included
if (-not $IncludeNodeModules) {
    $files = $files | Where-Object { 
        $exclude = $false
        foreach ($folder in $excludeFolders) {
            if ($_.FullName -match "\\$folder\\") {
                $exclude = $true
                break
            }
        }
        -not $exclude
    }
}

Write-Host "📊 Found $($files.Count) files to analyze" -ForegroundColor Cyan
Write-Host ""

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($content) {
        # Multiple estimation methods
        $charCount = $content.Length
        $wordCount = ($content -split '\s+' | Where-Object {$_.Length -gt 0}).Count
        $lineCount = ($content -split '\n').Count
        
        # Different approaches  
        $charBasedTokens = [Math]::Floor($charCount / 3.5)
        $wordBasedTokens = [Math]::Floor($wordCount * 1.3)
        $lineBasedTokens = [Math]::Floor($lineCount * 8)
        
        # Use highest estimate for safety
        $tokens = [Math]::Max([Math]::Max($charBasedTokens, $wordBasedTokens), $lineBasedTokens)
        
        $total += $tokens
        
        $fileDetails += [PSCustomObject]@{
            Name = $file.Name
            Path = $file.FullName
            Tokens = $tokens
            Lines = $lineCount
            Characters = $charCount
        }
        
        if ($Detailed) {
            Write-Host "  📄 $($file.Name): $($tokens.ToString('N0')) tokens" -ForegroundColor White
        }
    }
}

Write-Host ""
Write-Host "📊 SUMMARY:" -ForegroundColor Green
Write-Host "  Total Files: $($files.Count.ToString('N0'))" -ForegroundColor White  
Write-Host "  Total Tokens: $($total.ToString('N0'))" -ForegroundColor Yellow

# Cost estimation
$estimatedCost = ($total / 1000) * 0.01
Write-Host "  Estimated Cost: $$('{0:F4}' -f $estimatedCost) (INPUT tokens @ $0.01/1k)" -ForegroundColor Cyan
Write-Host ""

if ($Detailed -and $fileDetails.Count -gt 0) {
    Write-Host "🔥 TOP 10 TOKEN-HEAVY FILES:" -ForegroundColor Red
    $fileDetails | Sort-Object Tokens -Descending | Select-Object -First 10 | ForEach-Object {
        Write-Host "  $($_.Name): $($_.Tokens.ToString('N0')) tokens ($($_.Lines) lines)" -ForegroundColor White
    }
    Write-Host ""
}

Write-Host "💡 NOTES:" -ForegroundColor Blue
Write-Host "  • These are INPUT tokens (your existing code)" -ForegroundColor Gray
Write-Host "  • OUTPUT tokens (AI responses) cost 2-3x more" -ForegroundColor Gray
Write-Host "  • Use for planning AI session budgets" -ForegroundColor Gray
