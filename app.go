package main

import (
	"context"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"

	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

type InstallResult struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Output  string `json:"output"`
}

// SelectDebFile opens a native file picker restricted to Debian packages.
func (a *App) SelectDebFile() (string, error) {
	path, err := wailsRuntime.OpenFileDialog(a.ctx, wailsRuntime.OpenDialogOptions{
		Title: "Select a Debian package",
		Filters: []wailsRuntime.FileFilter{
			{
				DisplayName: "Debian package (*.deb)",
				Pattern:     "*.deb",
			},
		},
	})
	if err != nil {
		return "", err
	}
	if path == "" {
		return "", nil
	}

	if err := validateDebPath(path); err != nil {
		return "", err
	}

	return path, nil
}

// InstallDeb reinstalls the selected Debian package using graphical privilege escalation.
func (a *App) InstallDeb(path string) InstallResult {
	if runtime.GOOS != "linux" {
		return InstallResult{
			Success: false,
			Message: "Installation is only supported on Linux/Ubuntu. Build and run this app on Ubuntu to install .deb packages.",
		}
	}

	if err := validateDebPath(path); err != nil {
		return InstallResult{Success: false, Message: err.Error()}
	}

	if _, err := exec.LookPath("pkexec"); err != nil {
		return InstallResult{
			Success: false,
			Message: fmt.Sprintf("pkexec was not found. Install polkit/pkexec or run manually: sudo apt install --reinstall -y %q", path),
		}
	}

	commandContext := a.ctx
	if commandContext == nil {
		commandContext = context.Background()
	}

	cmd := exec.CommandContext(commandContext, "pkexec", "apt", "install", "--reinstall", "-y", path)
	output, err := cmd.CombinedOutput()
	result := InstallResult{Output: string(output)}
	if err != nil {
		result.Message = fmt.Sprintf("Installation failed: %v", err)
		return result
	}

	result.Success = true
	result.Message = "Package installed successfully."
	return result
}

func validateDebPath(path string) error {
	if strings.TrimSpace(path) == "" {
		return errors.New("select a .deb file before installing")
	}

	if strings.ToLower(filepath.Ext(path)) != ".deb" {
		return errors.New("selected file must have a .deb extension")
	}

	info, err := os.Stat(path)
	if err != nil {
		if os.IsNotExist(err) {
			return errors.New("selected .deb file does not exist")
		}
		return fmt.Errorf("could not access selected file: %w", err)
	}

	if !info.Mode().IsRegular() {
		return errors.New("selected path must be a regular .deb file")
	}

	return nil
}
