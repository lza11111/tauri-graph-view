#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::fs;

use tauri::{CustomMenuItem, Menu, Submenu, Runtime, WindowEvent};

#[tauri::command]
async fn toggle_fullscreen<R: Runtime>(window: tauri::Window<R>) -> Result<(), String> {
    let is_fullscreen = window.is_fullscreen().unwrap();
    if is_fullscreen {
        window.set_fullscreen(false).unwrap();
    } else {
        window.set_fullscreen(true).unwrap();
    }
    Ok(())  
}

#[tauri::command]
fn read_file(file_path: &str) -> Result<String, String> {
    let contents = fs::read_to_string(file_path).unwrap();
    Ok(contents)
}

fn main() {
    std::env::set_var(
        "WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS",
        "--ignore-gpu-blocklist",
      );
    let open_file_menu = CustomMenuItem::new("load_file".to_string(), "Load File");
    let file_menu = Submenu::new("File", Menu::new().add_item(open_file_menu));

    let menu = Menu::new().add_submenu(file_menu);
    tauri::Builder::default()
        .menu(menu)
        .on_menu_event(|event| match event.menu_item_id() {
            "load_file" => {
                event.window().emit("load_file", {}).unwrap();
            }
            "close" => {
                event.window().close().unwrap();
            }
            _ => {}
        })
        .on_window_event(|e| {
            if let WindowEvent::Resized(_) = e.event() {
                std::thread::sleep(std::time::Duration::from_millis(1));
            }
        })
        .invoke_handler(tauri::generate_handler![toggle_fullscreen, read_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
