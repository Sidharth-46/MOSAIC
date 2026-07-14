import pexpect
import sys

try:
    child = pexpect.spawn('catalyst appsail:setup', encoding='utf-8')
    child.expect('Enter your AppSail service name')
    child.sendline('backend2')
    child.expect('Select the stack', timeout=5)
    print("Found stack prompt:")
    try:
        child.expect('xyz_nonexistent', timeout=2)
    except pexpect.TIMEOUT:
        print(child.before)
except Exception as e:
    print(e)
