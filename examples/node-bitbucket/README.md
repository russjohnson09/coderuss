git subtree push --prefix=examples/node-bitbucket node-bitbucket develop
git subtree pull --prefix=examples/node-bitbucket node-bitbucket master


$ git clone --bare https://github.com/my/forked_repo.git
<delete forked_repo on GitHub>
<recreate repo on GitHub using same name>
$ cd forked_repo.git
$ git push --mirror