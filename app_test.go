package main

import (
	"os"
	"path/filepath"
	"testing"
)

func TestValidateDebPath(t *testing.T) {
	tempDir := t.TempDir()
	validPath := filepath.Join(tempDir, "package.deb")
	if err := os.WriteFile(validPath, []byte("package"), 0o600); err != nil {
		t.Fatal(err)
	}

	directoryPath := filepath.Join(tempDir, "directory.deb")
	if err := os.Mkdir(directoryPath, 0o700); err != nil {
		t.Fatal(err)
	}

	tests := []struct {
		name string
		path string
		want bool
	}{
		{name: "existing deb file", path: validPath, want: true},
		{name: "missing file", path: filepath.Join(tempDir, "missing.deb"), want: false},
		{name: "wrong extension", path: filepath.Join(tempDir, "package.txt"), want: false},
		{name: "directory with deb extension", path: directoryPath, want: false},
		{name: "empty path", path: "", want: false},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			err := validateDebPath(test.path)
			if (err == nil) != test.want {
				t.Fatalf("validateDebPath(%q) error = %v, want valid = %t", test.path, err, test.want)
			}
		})
	}
}
