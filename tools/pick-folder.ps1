# Abre a janela moderna do Windows (Explorer) para escolher uma pasta, sempre na frente das outras.
# Uso: powershell -STA -File pick-folder.ps1 "<pasta inicial>" "<título>"
param([string]$Initial = "", [string]$Title = "Selecione a pasta")
[Console]::OutputEncoding = [Text.Encoding]::UTF8
Add-Type -AssemblyName System.Windows.Forms
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public static class AtlasFolderPicker {
  [ComImport, Guid("DC1C5A9C-E88A-4dde-A5A1-60F82A20AEF7")] class FileOpenDialogRCW {}
  [ComImport, Guid("42f85136-db7e-439c-85f1-e4075d135fc8"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
  interface IFileDialog {
    [PreserveSig] int Show(IntPtr parent);
    void SetFileTypes(uint c, IntPtr f); void SetFileTypeIndex(uint i); void GetFileTypeIndex(out uint i);
    void Advise(IntPtr e, out uint c); void Unadvise(uint c);
    void SetOptions(uint o); void GetOptions(out uint o);
    void SetDefaultFolder(IShellItem i); void SetFolder(IShellItem i);
    void GetFolder(out IShellItem i); void GetCurrentSelection(out IShellItem i);
    void SetFileName([MarshalAs(UnmanagedType.LPWStr)] string n); void GetFileName([MarshalAs(UnmanagedType.LPWStr)] out string n);
    void SetTitle([MarshalAs(UnmanagedType.LPWStr)] string t); void SetOkButtonLabel([MarshalAs(UnmanagedType.LPWStr)] string t);
    void SetFileNameLabel([MarshalAs(UnmanagedType.LPWStr)] string t); void GetResult(out IShellItem i);
  }
  [ComImport, Guid("43826D1E-E718-42EE-BC55-A1E261C37BFE"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
  interface IShellItem {
    void BindToHandler(IntPtr p, ref Guid b, ref Guid r, out IntPtr v); void GetParent(out IShellItem i);
    void GetDisplayName(uint s, [MarshalAs(UnmanagedType.LPWStr)] out string n);
  }
  [DllImport("user32.dll")] static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] static extern void keybd_event(byte k, byte s, uint f, UIntPtr e);
  // O Windows só deixa trazer para a frente depois de uma tecla; um "Alt" vazio libera isso.
  public static void BringToFront(IntPtr h) { keybd_event(0x12, 0, 0, UIntPtr.Zero); keybd_event(0x12, 0, 2, UIntPtr.Zero); SetForegroundWindow(h); }
  [DllImport("shell32.dll", CharSet = CharSet.Unicode, PreserveSig = false)]
  static extern void SHCreateItemFromParsingName(string path, IntPtr bc, ref Guid riid, out IShellItem item);
  public static string Pick(IntPtr owner, string initial, string title) {
    var dialog = (IFileDialog)new FileOpenDialogRCW();
    dialog.SetOptions(0x20 | 0x40 | 0x800); // pastas, só sistema de arquivos, precisa existir
    dialog.SetTitle(title);
    if (!string.IsNullOrEmpty(initial) && System.IO.Directory.Exists(initial)) {
      try { var g = typeof(IShellItem).GUID; IShellItem folder; SHCreateItemFromParsingName(initial, IntPtr.Zero, ref g, out folder); dialog.SetFolder(folder); } catch {}
    }
    if (dialog.Show(owner) != 0) return "";
    IShellItem result; dialog.GetResult(out result);
    string path; result.GetDisplayName(0x80058000, out path);
    return path;
  }
}
"@

# Janela "dona" invisível e sempre no topo: assim a seleção não abre escondida atrás do navegador.
$owner = New-Object System.Windows.Forms.Form -Property @{ TopMost = $true; ShowInTaskbar = $false; Opacity = 0; FormBorderStyle = "None"; StartPosition = "CenterScreen"; Width = 1; Height = 1 }
$owner.Show()
[AtlasFolderPicker]::BringToFront($owner.Handle)
$owner.Activate()
$chosen = [AtlasFolderPicker]::Pick($owner.Handle, $Initial, $Title)
$owner.Close()
if ($chosen) { $chosen }
