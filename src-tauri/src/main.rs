#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{CustomMenuItem, Menu, MenuItem, Submenu, Runtime, WindowEvent};

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
async fn trigger_something<R: Runtime>(app: tauri::AppHandle<R>, window: tauri::Window<R>) -> Result<(), String> {
    Ok(())
}

fn main() {
    std::env::set_var(
        "WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS",
        "--ignore-gpu-blocklist",
      );
    tauri::Builder::default()
        .on_menu_event(|event| match event.menu_item_id() {
            "quit" => {
                std::process::exit(0);
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
        .invoke_handler(tauri::generate_handler![toggle_fullscreen])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
