#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![app_version, platform])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[tauri::command]
fn app_version() -> String {
  env!("CARGO_PKG_VERSION").to_string()
}

#[tauri::command]
fn platform() -> String {
  std::env::consts::OS.to_string()
}
