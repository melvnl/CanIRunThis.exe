use std::fs;
// use tauri::async_runtime::spawn;
use regex::Regex;

#[tauri::command]
async fn steam_app_details(appid: String) -> Result<serde_json::Value, String> {
    let url = format!("https://store.steampowered.com/api/appdetails?appids={}", appid);
    let resp = reqwest::get(&url)
        .await
        .map_err(|e| e.to_string())?
        .json::<serde_json::Value>()
        .await
        .map_err(|e| e.to_string())?;
    Ok(resp)
}

static CACHE_PATH: &str = "games_cache.json";

async fn fetch_and_cache_applist() -> Result<(), String> {
    let url = "https://api.steampowered.com/ISteamApps/GetAppList/v2/";
    let resp = reqwest::get(url)
        .await
        .map_err(|e| e.to_string())?
        .text()
        .await
        .map_err(|e| e.to_string())?;
    fs::write(CACHE_PATH, &resp).map_err(|e| e.to_string())?;
    Ok(())
}

async fn read_cache() -> Result<serde_json::Value, String> {
    let data = fs::read_to_string(CACHE_PATH).map_err(|e| e.to_string())?;
    let json: serde_json::Value = serde_json::from_str(&data).map_err(|e| e.to_string())?;
    Ok(json)
}

#[tauri::command]
async fn search_local_game(query: String) -> Result<Option<u32>, String> {
    let cache = read_cache().await?;
    let apps = cache["applist"]["apps"].as_array().ok_or("Invalid cache format")?;

    // Prepare regex to remove special characters
    let re = Regex::new(r"[^a-z0-9]").unwrap();

    // Normalize query
    let query_norm = re
        .replace_all(&query.to_lowercase(), "")
        .to_string();

    // First: try exact match
    for app in apps {
        if let Some(name) = app["name"].as_str() {
            let name_norm = re
                .replace_all(&name.to_lowercase().trim(), "")
                .to_string();

            if name_norm == query_norm {
                if let Some(appid) = app["appid"].as_u64() {
                    return Ok(Some(appid as u32));
                }
            }
        }
    }

    // Second: try contains (fuzzy)
    for app in apps {
        if let Some(name) = app["name"].as_str() {
            let name_norm = re
                .replace_all(&name.to_lowercase().trim(), "")
                .to_string();

            if name_norm.contains(&query_norm) {
                if let Some(appid) = app["appid"].as_u64() {
                    return Ok(Some(appid as u32));
                }
            }
        }
    }

    Ok(None)
}

#[tauri::command]
async fn update_game_cache_now() -> Result<(), String> {
    fetch_and_cache_applist().await
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
//   spawn(async move {
//     loop {
//       let _ = fetch_and_cache_applist().await;
//       tokio::time::sleep(tokio::time::Duration::from_secs(60 * 60 * 24 * 90)).await; // 3 months
//     }
//   });
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![steam_app_details, search_local_game, update_game_cache_now])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
