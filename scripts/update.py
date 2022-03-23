import subprocess
import datetime

FORCE_UPDATE = False

print("Starting update process at: ", datetime.datetime.now())

# Check if there is an update, if not exit
subprocess.run(["git", "remote", "update"])
diff = subprocess.run(["git", "status"], stdout=subprocess.PIPE, text=True)
diff.stdout.find("yeet")

if diff.stdout.find("behind") != -1:
    print("Branch is behind origin: updating deployment...")
    subprocess.run(["git","pull"])

    # Do update
    subprocess.run(["sh", "mvnw", "install"]) # Not clean install as this would take longer
    subprocess.run(["docker-compose", "build"])
    subprocess.run(["docker-compose", "up", "--build", "--force-recreate", "-d"])

    print("Deployment updated")
else: print('Explorer is up to date: No changes on master')
print("Update process finished at: ", datetime.datetime.now())
