# PowerShell script to query PostgreSQL database using .NET
$connectionString = "Host=db.psnorowqvedupuievxnh.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=B9bB1lh0oGvp4Ekk"

try {
    # Load the Npgsql assembly
    Add-Type -Path "C:\Program Files\PackageManagement\NuGet\Packages\Npgsql.4.0.0\lib\net451\Npgsql.dll" -ErrorAction Stop
} 
catch {
    Write-Host "Failed to load Npgsql assembly: $_"
    Write-Host "Trying to install Npgsql via NuGet..."
    
    # Try to install Npgsql via NuGet
    if (-not (Get-Command nuget.exe -ErrorAction SilentlyContinue)) {
        $nugetPath = "$env:TEMP\nuget.exe"
        Invoke-WebRequest -Uri "https://dist.nuget.org/win-x86-commandline/latest/nuget.exe" -OutFile $nugetPath
        Write-Host "Downloaded NuGet.exe to $nugetPath"
    }
    
    # Create a packages directory
    $packagesDir = ".\packages"
    if (-not (Test-Path $packagesDir)) {
        New-Item -Path $packagesDir -ItemType Directory | Out-Null
    }
    
    # Install Npgsql
    & nuget.exe install Npgsql -OutputDirectory $packagesDir
    $npgsqlPath = Get-ChildItem -Path $packagesDir -Recurse -Filter "Npgsql.dll" | Select-Object -First 1 -ExpandProperty FullName
    
    if ($npgsqlPath) {
        Add-Type -Path $npgsqlPath
        Write-Host "Loaded Npgsql from $npgsqlPath"
    } else {
        Write-Host "Failed to find Npgsql.dll"
        exit 1
    }
}

try {
    Write-Host "Connecting to PostgreSQL database..."
    $connection = New-Object Npgsql.NpgsqlConnection($connectionString)
    $connection.Open()
    
    Write-Host "Connected successfully. Querying student table structure..."
    
    # Query to get the column information for public.students table
    $query = @"
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'students'
    ORDER BY ordinal_position;
"@
    
    $command = New-Object Npgsql.NpgsqlCommand($query, $connection)
    $reader = $command.ExecuteReader()
    
    Write-Host "`nStudents Table Structure:"
    Write-Host "------------------------"
    
    while ($reader.Read()) {
        $columnName = $reader["column_name"]
        $dataType = $reader["data_type"]
        $isNullable = $reader["is_nullable"]
        $columnDefault = $reader["column_default"]
        
        Write-Host "Column: $columnName"
        Write-Host "  Data Type: $dataType"
        Write-Host "  Nullable: $isNullable"
        Write-Host "  Default: $columnDefault"
        Write-Host ""
    }
    
    $reader.Close()
    
    # Check if there's a user_id column connecting to auth.users
    $query = @"
    SELECT 
        COUNT(*) AS has_user_id_column
    FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'students'
    AND column_name = 'user_id';
"@
    
    $command = New-Object Npgsql.NpgsqlCommand($query, $connection)
    $result = $command.ExecuteScalar()
    
    if ($result -gt 0) {
        Write-Host "The 'students' table has a 'user_id' column that can be used for RLS policies."
    } else {
        Write-Host "WARNING: The 'students' table does NOT have a 'user_id' column."
        Write-Host "You need to add a 'user_id' column to link students to auth.users for proper RLS."
    }
    
    # Check if RLS is enabled on the students table
    $query = @"
    SELECT 
        nspname || '.' || relname AS table_name,
        relrowsecurity AS rls_enabled
    FROM pg_class
    JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
    WHERE nspname = 'public' AND relname = 'students';
"@
    
    $command = New-Object Npgsql.NpgsqlCommand($query, $connection)
    $reader = $command.ExecuteReader()
    
    Write-Host "`nRLS Status:"
    if ($reader.Read()) {
        $rlsEnabled = $reader["rls_enabled"]
        if ($rlsEnabled -eq 'True') {
            Write-Host "Row Level Security (RLS) is ENABLED on the students table."
        } else {
            Write-Host "Row Level Security (RLS) is DISABLED on the students table."
        }
    } else {
        Write-Host "Could not determine RLS status."
    }
    
    $reader.Close()
    $connection.Close()
}
catch {
    Write-Host "Error querying PostgreSQL: $_"
} 