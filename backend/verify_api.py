import httpx
import sys
import argparse
import time

def verify_api(host: str, port: int):
    base_url = f"http://{host}:{port}"
    print(f"Verifying Snake Arena API at {base_url}...")
    
    with httpx.Client(base_url=base_url, timeout=5.0) as client:
        try:
            # 1. Check Root/Docs
            print("Checking /docs health...")
            res = client.get("/docs")
            assert res.status_code == 200
            print("✓ Swagger UI is reachable")

            # 2. Check Auth endpoints (Signup)
            print("Testing /auth/signup...")
            test_user = {
                "username": f"TestRunner_{int(time.time())}",
                "email": f"test_{int(time.time())}@verify.com",
                "password": "password123"
            }
            res = client.post("/auth/signup", json=test_user)
            assert res.status_code == 200
            auth_data = res.json()
            token = auth_data["token"]
            print(f"✓ Signup success for {test_user['username']}")

            # 3. Check Leaderboard
            print("Testing /leaderboard...")
            res = client.get("/leaderboard")
            assert res.status_code == 200
            print(f"✓ Leaderboard returned {len(res.json())} entries")

            # 4. Check Live Games
            print("Testing /live-games...")
            res = client.get("/live-games")
            assert res.status_code == 200
            print(f"✓ Live games returned {len(res.json())} games")

            # 5. Check Protected Route (/auth/me)
            print("Testing /auth/me (Protected)...")
            res = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
            assert res.status_code == 200
            assert res.json()["username"] == test_user["username"]
            print("✓ JWT authentication works")

            print("\n================================")
            print("ALL SYSTEMS OPERATIONAL")
            print("================================")
            
        except httpx.ConnectError:
            print(f"\nERROR: Could not connect to the server at {base_url}.")
            print("Make sure your backend is running (e.g., 'uv run uvicorn main:app --port 8081')")
            sys.exit(1)
        except AssertionError as e:
            print(f"\nVERIFICATION FAILED: An endpoint did not return the expected result.")
            sys.exit(1)
        except Exception as e:
            print(f"\nAN UNEXPECTED ERROR OCCURRED: {str(e)}")
            sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Verify a running Snake Arena backend.")
    parser.add_argument("--host", default="127.0.0.1", help="Server host (default: 127.0.0.1)")
    parser.add_argument("--port", type=int, default=8081, help="Server port (default: 8081)")
    
    args = parser.parse_args()
    verify_api(args.host, args.port)
