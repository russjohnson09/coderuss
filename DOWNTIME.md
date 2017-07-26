#2017-07-25 Site down due to missing npm package `sinon`.
Fix - set NODE_ENV = 'production' and run tests in docker
for more changes using new packages or any complex
changes.

Watch for deploy and set deploy back to most recent
successful commit if failed.

Keep another branch called master_deployed and keep it
up to date with master. If master fails to launch,
switch to master_deployed.