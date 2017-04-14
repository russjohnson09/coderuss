sudo apt-get install texlive-latex-base

sudo apt-get install xzdec


<!--http://tex.stackexchange.com/questions/137428/tlmgr-cannot-setup-tlpdb-->
tlmgr init-usertree

<!--/usr/bin/tlmgr: Please install xzdec and try again.-->

tlmgr install multicols

tlmgr install <package>



sudo $(which tlmgr) install multicols


<!--https://www.npmjs.com/package/hackmyresume-->