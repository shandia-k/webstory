from playwright.sync_api import sync_playwright, expect
import time

def verify_styles(page):
    # Navigate to the game URL
    # Assuming base path is /webstory/ as per memory
    page.goto("http://localhost:4173/webstory/")

    # Wait for the app to load
    page.wait_for_selector("body")

    # Check if font-quicksand is applied (or standard font if quicksand not loaded yet)
    # But mainly we want to see if the page renders without errors.

    # Inject state to simulate "Game" phase to see CuteInterface
    # We need to set localStorage before loading the page or reload after setting it.

    # Define state
    state = {
        "phase": "game",
        "selectedWorld": "fantasy",
        "adoptedPal": {
            "name": "Bolt",
            "role": {
                "element": "fire",
                "stats": {"happiness": 80, "energy": 60, "hunger": 50},
                "emoji": ["🔥"]
            }
        },
        "wallet": {"gold": 100}
    }

    # Set local storage
    page.evaluate(f"window.localStorage.setItem('omnihub_last_session', JSON.stringify({state}))")
    page.reload()

    # Wait for CuteInterface
    # It has text "Bolt" (pal name)
    page.get_by_text("Bolt").first.wait_for()

    # Take screenshot of CuteInterface
    page.screenshot(path=".Jules/verification/cute_interface.png")

    # Verify StatsDisplay exists and has classes
    # We can check if the elements are present.
    # The stats are happiness, energy, hunger.
    expect(page.get_by_text("Happiness")).to_be_visible()

    print("Verification passed!")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_styles(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path=".Jules/verification/error.png")
        finally:
            browser.close()
