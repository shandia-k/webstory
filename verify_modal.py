from playwright.sync_api import sync_playwright
import json

def verify_save_load_modal():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()

        # Inject game state
        game_state = {
            "phase": "game",
            "selectedWorld": "terra_prime",
            "adoptedPal": {
                "name": "Buddy",
                "role": "Companion",
                "stats": {"health": 100}
            }
        }

        context.add_init_script(f"""
            localStorage.setItem('omnihub_last_session', '{json.dumps(game_state)}');
            localStorage.setItem('nexus_debug_history', '[]');
        """)

        page = context.new_page()

        try:
            page.goto("http://localhost:4173/webstory/")
            page.wait_for_load_state("networkidle")

            # Find the Settings button in CuteInterface
            settings_btn = page.get_by_label("Settings", exact=True)
            settings_btn.click()

            # Wait for Save & Load Modal
            # Since multiple dialogs exist, we use the specific aria-labelledby we added
            modal = page.locator("div[role='dialog'][aria-labelledby='save-load-title']")
            modal.wait_for(state="visible", timeout=5000)

            # Take screenshot of the accessible modal
            page.screenshot(path="final_verification.png")

            print("Found modal with role='dialog' and correct label")

            # Check focus
            page.wait_for_timeout(200) # Wait for focus timeout
            focused_label = page.evaluate("document.activeElement.getAttribute('aria-label')")
            print(f"Focused element aria-label: {focused_label}")

            if focused_label == "Save current game":
                print("SUCCESS: Focus is on Save Game button")
            else:
                print(f"FAIL: Focus is on {focused_label}")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="error_final.png")

        finally:
            browser.close()

if __name__ == "__main__":
    verify_save_load_modal()
