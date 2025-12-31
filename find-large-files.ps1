$files = Get-ChildItem -Recurse -Include *.vue,*.ts,*.js,*.tsx,*.jsx -File
$results = @()

foreach ($file in $files) {
    try {
        $lines = (Get-Content $file.FullName -ErrorAction SilentlyContinue | Measure-Object -Line).Lines
        if ($lines -gt 1000) {
            $relativePath = $file.FullName.Replace((Get-Location).Path + '\', '')
            $results += [PSCustomObject]@{
                File = $relativePath
                Lines = $lines
            }
        }
    } catch {
        # Ignore errors
    }
}

$results | Sort-Object Lines -Descending | Format-Table -AutoSize

