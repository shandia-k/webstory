from playwright.sync_api import sync_playwright

def verify_cute_interface():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Subscribe to console logs to debug potential errors
        page.on("console", lambda msg: print(f"Browser Console: {msg.text}"))

        try:
            print("Navigating...")
            page.goto("http://localhost:4173/webstory/")

            print("Injecting state...")
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

            print("Reloading...")
            page.reload()

            print("Waiting for content...")
            # Wait for any text to appear, or a specific element
            try:
                page.wait_for_selector('text=Robo', timeout=30000)
                print("Found 'Robo' text.")
            except Exception as e:
                print(f"Timeout waiting for 'Robo': {e}")
                # Dump content to see what's there
                content = page.content()
                print(f"Page Content Preview: {content[:500]}...")

            # Take screenshot regardless of success to see state
            page.screenshot(path="verification/cute_interface_retry.png")
            print("Screenshot taken: verification/cute_interface_retry.png")

        except Exception as e:
            print(f"Error: {e}")
            try:
                page.screenshot(path="verification/error_retry.png")
            except:
                pass
        finally:
            browser.close()

if __name__ == "__main__":
    verify_cute_interface()
