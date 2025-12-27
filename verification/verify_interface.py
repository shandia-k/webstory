from playwright.sync_api import sync_playwright

def verify_cute_interface():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Note: In this environment, 'localhost' might not be reachable from inside the container
        # via playwright if using 0.0.0.0, but usually localhost works.
        # If not, try 127.0.0.1.
        page = browser.new_page()

        try:
            # Navigate to the app
            # The memory says: "The project is deployed at `/webstory/`; verification scripts... must append this base path"
            page.goto("http://localhost:4173/webstory/")

            # Inject state to bypass onboarding and go straight to game
            # Memory says: inject a state object with { phase: 'game', ... } into localStorage under the key omnihub_last_session
            page.evaluate("""() => {
                localStorage.setItem('omnihub_last_session', JSON.stringify({
                    phase: 'game',
                    genre: 'scifi',
                    palData: {
                        name: 'Robo',
                        role: {
                            id: 'robot_companion',
                            name: 'Robot Companion',
                            emoji: '🤖',
                            stats: { happiness: 80, energy: 60, hunger: 50, xp: 0, level: 1 }
                        }
                    }
                }));
            }""")

            # Reload to apply state
            page.reload()

            # Wait for content to load
            # Look for elements from CuteInterface
            # e.g., the emoji or stats
            page.wait_for_selector('text=Robo', timeout=10000)

            # Take screenshot
            page.screenshot(path="verification/cute_interface.png")
            print("Screenshot taken: verification/cute_interface.png")

        except Exception as e:
            print(f"Error: {e}")
            # Take screenshot even on error if possible
            try:
                page.screenshot(path="verification/error.png")
            except:
                pass
        finally:
            browser.close()

if __name__ == "__main__":
    verify_cute_interface()
