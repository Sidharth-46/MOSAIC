import pexpect
import sys

try:
    child = pexpect.spawn('catalyst deploy', encoding='utf-8')
    child.logfile = sys.stdout
    child.expect(pexpect.EOF, timeout=10)
except pexpect.TIMEOUT:
    print("\n[TIMEOUT] Current output before timeout:")
    print(child.before)
except Exception as e:
    print(f"Error: {e}")
