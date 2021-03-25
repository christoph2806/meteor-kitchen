#!/bin/bash

set -e

METEOR_RELEASE=""
CLEAN=""
DEPLOY=""
LINUX=""

for arg in "$@"
do
	if [ "$arg" == "release_1351" ]
	then
		METEOR_RELEASE="--meteor-release 1.3.5.1"
		echo "*** Using Meteor 1.3.5.1 ***"
	fi

	if [ "$arg" == "release_1614" ]
	then
		METEOR_RELEASE="--meteor-release 1.6.1.4"
		echo "*** Using Meteor 1.6.1.4 ***"
	fi

	if [ "$arg" == "clean" ]
	then
		CLEAN="clean"
		echo "*** CLEAN BUILD ***"
	fi

	if [ "$arg" == "deploy" ]
	then
		DEPLOY="deploy"
		echo "*** DEPLOY ***"
	fi

	if [ "$arg" == "linux" ]
	then
		LINUX="linux"
		echo "*** CLEAN BUILD ***"
	fi
done


if [ "$LINUX" == "linux" ]
then
	echo "*** LINUX BUILD ***"

	cd ~/meteor/meteor-kitchen/kitchen-cli/
	make -f linux.mk clean
	make -f linux.mk

	cd ~/meteor/meteor-kitchen/kitchen-docs
	make -f linux.mk clean
	make -f linux.mk

	cd ~/meteor/meteor-kitchen/kitchen-base
	npm install underscore --save

	exit
fi


echo "Converting examples to yaml..."
cd ~/meteor/meteor-kitchen/kitchen-cli/examples/
js-yaml ./example-accounts/example-accounts.json > ./example-accounts/example-accounts.yaml
js-yaml ./example-admin/example-admin.json > ./example-admin/example-admin.yaml
js-yaml ./example-admin-layout/example-admin-layout.json > ./example-admin-layout/example-admin-layout.yaml
js-yaml ./example-dataview/example-dataview.json > ./example-dataview/example-dataview.yaml
js-yaml ./example-geiger/example-geiger.json > ./example-geiger/example-geiger.yaml
js-yaml ./example-ide/example-ide.json > ./example-ide/example-ide.yaml
js-yaml ./example-invoices/example-invoices.json > ./example-invoices/example-invoices.yaml
js-yaml ./example-bigchaindb/example-bigchaindb.json > ./example-bigchaindb/example-bigchaindb.yaml
js-yaml ./example-human2machine/example-human2machine.json > ./example-human2machine/example-human2machine.yaml
js-yaml ./example-iot/example-iot.json > ./example-iot/example-iot.yaml
js-yaml ./example-markdowned/example-markdowned.json > ./example-markdowned/example-markdowned.yaml
js-yaml ./example-minimal/example-minimal.json > ./example-minimal/example-minimal.yaml
js-yaml ./example-onepage/example-onepage.json > ./example-onepage/example-onepage.yaml
js-yaml ./example-photosharing/example-photosharing.json > ./example-photosharing/example-photosharing.yaml
js-yaml ./example-plugins/example-plugins.json > ./example-plugins/example-plugins.yaml
js-yaml ./example-subpages/example-subpages.json > ./example-subpages/example-subpages.yaml
js-yaml ./example-upload/example-upload.json > ./example-upload/example-upload.yaml
js-yaml ./example-semantic/example-semantic.json > ./example-semantic/example-semantic.yaml
js-yaml ./example-materialize/example-materialize.json > ./example-materialize/example-materialize.yaml
js-yaml ./example-cpu/example-cpu.json > ./example-cpu/example-cpu.yaml
js-yaml ./example-starwars/example-starwars.json > ./example-starwars/example-starwars.yaml
js-yaml ./example-aframe-iss/example-aframe-iss.json > ./example-aframe-iss/example-aframe-iss.yaml
js-yaml ./example-layout-sidenav/example-layout-sidenav.json > ./example-layout-sidenav/example-layout-sidenav.yaml
echo "OK"

cd ~/meteor/

if [ "$CLEAN" == "clean" ]
then
	rm -rf ./example-dataview
	rm -rf ./example-subpages
	rm -rf ./example-minimal
	rm -rf ./example-plugins
	rm -rf ./example-accounts
	rm -rf ./example-admin
	rm -rf ./example-admin-layout
	rm -rf ./example-invoices
	rm -rf ./example-bigchaindb
	rm -rf ./example-onepage
	rm -rf ./example-markdowned
	rm -rf ./example-photosharing
	rm -rf ./example-upload
	rm -rf ./example-iot
	rm -rf ./example-geiger
	rm -rf ./example-ide
	rm -rf ./example-human
	rm -rf ./example-human-iot
	rm -rf ./example-human2machine
	rm -rf ./example-semantic
	rm -rf ./example-materialize
	rm -rf ./example-cpu
	rm -rf ./example-starwars
	rm -rf ./example-aframe-iss
	rm -rf ./example-layout-sidenav

	rm -rf ./example-dataview-react
	rm -rf ./example-subpages-react
	rm -rf ./example-minimal-react
#	rm -rf ./example-plugins-react
	rm -rf ./example-accounts-react
	rm -rf ./example-admin-react
	rm -rf ./example-admin-layout-react
	rm -rf ./example-invoices-react
	rm -rf ./example-bigchaindb-react
	rm -rf ./example-onepage-react
	rm -rf ./example-markdowned-react
	rm -rf ./example-photosharing-react
	rm -rf ./example-upload-react
	rm -rf ./example-iot-react
	rm -rf ./example-geiger-react
	rm -rf ./example-ide-react
	rm -rf ./example-human-react
	rm -rf ./example-human-iot-react
	rm -rf ./example-human2machine-react
#	rm -rf ./example-semantic-react
#	rm -rf ./example-materialize-react
	rm -rf ./example-cpu-react
	rm -rf ./example-starwars-react
	rm -rf ./example-layout-sidenav-react

	rm -rf ./kitchen-old
fi

meteor-kitchen --example-dataview ./example-dataview $METEOR_RELEASE
meteor-kitchen --example-subpages ./example-subpages $METEOR_RELEASE
meteor-kitchen --example-minimal ./example-minimal $METEOR_RELEASE
meteor-kitchen --example-plugins ./example-plugins $METEOR_RELEASE
meteor-kitchen --example-accounts ./example-accounts $METEOR_RELEASE
meteor-kitchen --example-admin ./example-admin $METEOR_RELEASE
meteor-kitchen --example-admin-layout ./example-admin-layout $METEOR_RELEASE
meteor-kitchen --example-onepage ./example-onepage $METEOR_RELEASE
meteor-kitchen --example-invoices ./example-invoices $METEOR_RELEASE
#meteor-kitchen --example-bigchaindb ./example-bigchaindb $METEOR_RELEASE
meteor-kitchen --example-markdowned ./example-markdowned $METEOR_RELEASE
meteor-kitchen --example-photosharing ./example-photosharing $METEOR_RELEASE
meteor-kitchen --example-upload ./example-upload $METEOR_RELEASE
meteor-kitchen --example-iot ./example-iot $METEOR_RELEASE
meteor-kitchen --example-geiger ./example-geiger $METEOR_RELEASE
meteor-kitchen --example-ide ./example-ide $METEOR_RELEASE
meteor-kitchen --example-human ./example-human $METEOR_RELEASE
meteor-kitchen --example-human-iot ./example-human-iot $METEOR_RELEASE
meteor-kitchen --example-human2machine ./example-human2machine $METEOR_RELEASE
meteor-kitchen --example-semantic ./example-semantic $METEOR_RELEASE
meteor-kitchen --example-materialize ./example-materialize $METEOR_RELEASE
meteor-kitchen --example-cpu ./example-cpu $METEOR_RELEASE
meteor-kitchen --example-starwars ./example-starwars $METEOR_RELEASE
meteor-kitchen --example-aframe-iss ./example-aframe-iss $METEOR_RELEASE
meteor-kitchen --example-layout-sidenav ./example-layout-sidenav $METEOR_RELEASE

meteor-kitchen --example-dataview ./example-dataview-react --react $METEOR_RELEASE
meteor-kitchen --example-subpages ./example-subpages-react --react $METEOR_RELEASE
meteor-kitchen --example-minimal ./example-minimal-react --react $METEOR_RELEASE
# meteor-kitchen --example-plugins ./example-plugins-react --react $METEOR_RELEASE
meteor-kitchen --example-accounts ./example-accounts-react --react $METEOR_RELEASE
meteor-kitchen --example-admin ./example-admin-react --react $METEOR_RELEASE
meteor-kitchen --example-admin-layout ./example-admin-layout-react --react $METEOR_RELEASE
meteor-kitchen --example-onepage ./example-onepage-react --react $METEOR_RELEASE
meteor-kitchen --example-invoices ./example-invoices-react --react $METEOR_RELEASE
#meteor-kitchen --example-bigchaindb ./example-bigchaindb-react --react $METEOR_RELEASE
meteor-kitchen --example-markdowned ./example-markdowned-react --react $METEOR_RELEASE
meteor-kitchen --example-photosharing ./example-photosharing-react --react $METEOR_RELEASE
meteor-kitchen --example-upload ./example-upload-react --react $METEOR_RELEASE
meteor-kitchen --example-iot ./example-iot-react --react $METEOR_RELEASE
meteor-kitchen --example-geiger ./example-geiger-react --react $METEOR_RELEASE
meteor-kitchen --example-ide ./example-ide-react --react $METEOR_RELEASE
meteor-kitchen --example-human ./example-human-react --react $METEOR_RELEASE
meteor-kitchen --example-human-iot ./example-human-iot-react --react $METEOR_RELEASE
meteor-kitchen --example-human2machine ./example-human2machine-react --react $METEOR_RELEASE
# meteor-kitchen --example-semantic ./example-semantic-react --react $METEOR_RELEASE
# meteor-kitchen --example-materialize ./example-materialize-react --react $METEOR_RELEASE
meteor-kitchen --example-cpu ./example-cpu-react --react $METEOR_RELEASE
meteor-kitchen --example-starwars ./example-starwars-react --react $METEOR_RELEASE
meteor-kitchen --example-layout-sidenav ./example-layout-sidenav-react --react $METEOR_RELEASE


cp ~/meteor/meteor-kitchen/kitchen-cli/install/example-deploy/deploy.sh ~/meteor/example-minimal/deploy.sh
cp ~/meteor/meteor-kitchen/kitchen-cli/install/example-deploy/deploy.sh ~/meteor/example-dataview/deploy.sh
cp ~/meteor/meteor-kitchen/kitchen-cli/install/example-deploy/deploy.sh ~/meteor/example-subpages/deploy.sh
cp ~/meteor/meteor-kitchen/kitchen-cli/install/example-deploy/deploy.sh ~/meteor/example-plugins/deploy.sh
cp ~/meteor/meteor-kitchen/kitchen-cli/install/example-deploy/deploy.sh ~/meteor/example-accounts/deploy.sh
cp ~/meteor/meteor-kitchen/kitchen-cli/install/example-deploy/deploy.sh ~/meteor/example-onepage/deploy.sh
cp ~/meteor/meteor-kitchen/kitchen-cli/install/example-deploy/deploy.sh ~/meteor/example-invoices/deploy.sh
cp ~/meteor/meteor-kitchen/kitchen-cli/install/example-deploy/deploy.sh ~/meteor/example-bigchaindb/deploy.sh
cp ~/meteor/meteor-kitchen/kitchen-cli/install/example-deploy/deploy.sh ~/meteor/example-markdowned/deploy.sh
cp ~/meteor/meteor-kitchen/kitchen-cli/install/example-deploy/deploy.sh ~/meteor/example-photosharing/deploy.sh
cp ~/meteor/meteor-kitchen/kitchen-cli/install/example-deploy/deploy.sh ~/meteor/example-upload/deploy.sh
cp ~/meteor/meteor-kitchen/kitchen-cli/install/example-deploy/deploy.sh ~/meteor/example-iot/deploy.sh
cp ~/meteor/meteor-kitchen/kitchen-cli/install/example-deploy/deploy.sh ~/meteor/example-geiger/deploy.sh
cp ~/meteor/meteor-kitchen/kitchen-cli/install/example-deploy/deploy.sh ~/meteor/example-ide/deploy.sh
cp ~/meteor/meteor-kitchen/kitchen-cli/install/example-deploy/deploy.sh ~/meteor/example-human/deploy.sh
cp ~/meteor/meteor-kitchen/kitchen-cli/install/example-deploy/deploy.sh ~/meteor/example-human-iot/deploy.sh
cp ~/meteor/meteor-kitchen/kitchen-cli/install/example-deploy/deploy.sh ~/meteor/example-human2machine/deploy.sh
cp ~/meteor/meteor-kitchen/kitchen-cli/install/example-deploy/deploy.sh ~/meteor/example-semantic/deploy.sh
cp ~/meteor/meteor-kitchen/kitchen-cli/install/example-deploy/deploy.sh ~/meteor/example-materialize/deploy.sh
cp ~/meteor/meteor-kitchen/kitchen-cli/install/example-deploy/deploy.sh ~/meteor/example-cpu/deploy.sh
cp ~/meteor/meteor-kitchen/kitchen-cli/install/example-deploy/deploy.sh ~/meteor/example-starwars/deploy.sh
cp ~/meteor/meteor-kitchen/kitchen-cli/install/example-deploy/deploy.sh ~/meteor/example-aframe-iss/deploy.sh
cp ~/meteor/meteor-kitchen/kitchen-cli/install/example-deploy/deploy.sh ~/meteor/example-layout-sidenav/deploy.sh

cp ~/meteor/meteor-kitchen/kitchen-cli/install/example-deploy/deploy_remote.sh ~/meteor/example-minimal/deploy_remote.sh
cp ~/meteor/meteor-kitchen/kitchen-cli/install/example-deploy/deploy_remote.sh ~/meteor/example-dataview/deploy_remote.sh
cp ~/meteor/meteor-kitchen/kitchen-cli/install/example-deploy/deploy_remote.sh ~/meteor/example-subpages/deploy_remote.sh
cp ~/meteor/meteor-kitchen/kitchen-cli/install/example-deploy/deploy_remote.sh ~/meteor/example-plugins/deploy_remote.sh
cp ~/meteor/meteor-kitchen/kitchen-cli/install/example-deploy/deploy_remote.sh ~/meteor/example-accounts/deploy_remote.sh
cp ~/meteor/meteor-kitchen/kitchen-cli/install/example-deploy/deploy_remote.sh ~/meteor/example-onepage/deploy_remote.sh
cp ~/meteor/meteor-kitchen/kitchen-cli/install/example-deploy/deploy_remote.sh ~/meteor/example-invoices/deploy_remote.sh
cp ~/meteor/meteor-kitchen/kitchen-cli/install/example-deploy/deploy_remote.sh ~/meteor/example-bigchaindb/deploy_remote.sh
cp ~/meteor/meteor-kitchen/kitchen-cli/install/example-deploy/deploy_remote.sh ~/meteor/example-markdowned/deploy_remote.sh
cp ~/meteor/meteor-kitchen/kitchen-cli/install/example-deploy/deploy_remote.sh ~/meteor/example-photosharing/deploy_remote.sh
cp ~/meteor/meteor-kitchen/kitchen-cli/install/example-deploy/deploy_remote.sh ~/meteor/example-upload/deploy_remote.sh
cp ~/meteor/meteor-kitchen/kitchen-cli/install/example-deploy/deploy_remote.sh ~/meteor/example-iot/deploy_remote.sh
cp ~/meteor/meteor-kitchen/kitchen-cli/install/example-deploy/deploy_remote.sh ~/meteor/example-geiger/deploy_remote.sh
cp ~/meteor/meteor-kitchen/kitchen-cli/install/example-deploy/deploy_remote.sh ~/meteor/example-ide/deploy_remote.sh
cp ~/meteor/meteor-kitchen/kitchen-cli/install/example-deploy/deploy_remote.sh ~/meteor/example-human/deploy_remote.sh
cp ~/meteor/meteor-kitchen/kitchen-cli/install/example-deploy/deploy_remote.sh ~/meteor/example-human-iot/deploy_remote.sh
cp ~/meteor/meteor-kitchen/kitchen-cli/install/example-deploy/deploy_remote.sh ~/meteor/example-human2machine/deploy_remote.sh
cp ~/meteor/meteor-kitchen/kitchen-cli/install/example-deploy/deploy_remote.sh ~/meteor/example-semantic/deploy_remote.sh
cp ~/meteor/meteor-kitchen/kitchen-cli/install/example-deploy/deploy_remote.sh ~/meteor/example-materialize/deploy_remote.sh
cp ~/meteor/meteor-kitchen/kitchen-cli/install/example-deploy/deploy_remote.sh ~/meteor/example-cpu/deploy_remote.sh
cp ~/meteor/meteor-kitchen/kitchen-cli/install/example-deploy/deploy_remote.sh ~/meteor/example-starwars/deploy_remote.sh
cp ~/meteor/meteor-kitchen/kitchen-cli/install/example-deploy/deploy_remote.sh ~/meteor/example-aframe-iss/deploy_remote.sh
cp ~/meteor/meteor-kitchen/kitchen-cli/install/example-deploy/deploy_remote.sh ~/meteor/example-layout-sidenav/deploy_remote.sh

chmod +x ~/meteor/example-*/deploy*.sh

if [ "$DEPLOY" == "deploy" ]
then
	cd ./example-dataview
	./deploy.sh example-dataview
	cd ..

	cd ./example-subpages
	./deploy.sh example-subpages
	cd ..

	cd ./example-minimal
	./deploy.sh example-minimal
	cd ..

	cd ./example-plugins
	./deploy.sh example-plugins
	cd ..

	cd ./example-accounts
	./deploy.sh example-accounts
	cd ..

	cd ./example-invoices
	./deploy.sh example-invoices
	cd ..

	cd ./example-bigchaindb
	./deploy.sh example-bigchaindb
	cd ..

	cd ./example-onepage
	./deploy.sh example-onepage
	cd ..

	cd ./example-markdowned
	./deploy.sh example-markdowned
	cd ..

	cd ./example-photosharing
	./deploy.sh example-photosharing
	cd ..

	cd ./example-upload
	./deploy.sh example-upload
	cd ..

	cd ./example-iot
	./deploy.sh example-iot
	cd ..

	cd ./example-geiger
	./deploy.sh example-geiger
	cd ..

	cd ./example-ide
	./deploy.sh example-ide
	cd ..

	cd ./example-human
	./deploy.sh example-human
	cd ..

	cd ./example-human-iot
	./deploy.sh example-human-iot
	cd ..

	cd ./example-human2machine
	./deploy.sh example-human2machine
	cd ..

	cd ./example-semantic
	./deploy.sh example-semantic
	cd ..

	cd ./example-materialize
	./deploy.sh example-materialize
	cd ..

	cd ./example-cpu
	./deploy.sh example-cpu
	cd ..

	cd ./example-starwars
	./deploy.sh example-starwars
	cd ..

	cd ./example-aframe-iss
	./deploy.sh example-aframe-iss
	cd ..

	cd ./example-layout-sidenav
	./deploy.sh example-layout-sidenav
	cd ..
fi

cp ~/meteor/meteor-kitchen/kitchen-cli/examples/example-minimal/example-minimal.json ~/meteor/meteor-kitchen/kitchen-old/files/examples/
cp ~/meteor/meteor-kitchen/kitchen-cli/examples/example-accounts/example-accounts.json ~/meteor/meteor-kitchen/kitchen-old/files/examples/
cp ~/meteor/meteor-kitchen/kitchen-cli/examples/example-admin/example-admin.json ~/meteor/meteor-kitchen/kitchen-old/files/examples/
cp ~/meteor/meteor-kitchen/kitchen-cli/examples/example-admin-layout/example-admin-layout.json ~/meteor/meteor-kitchen/kitchen-old/files/examples/
cp ~/meteor/meteor-kitchen/kitchen-cli/examples/example-dataview/example-dataview.json ~/meteor/meteor-kitchen/kitchen-old/files/examples/
cp ~/meteor/meteor-kitchen/kitchen-cli/examples/example-invoices/example-invoices.json ~/meteor/meteor-kitchen/kitchen-old/files/examples/
cp ~/meteor/meteor-kitchen/kitchen-cli/examples/example-bigchaindb/example-bigchaindb.json ~/meteor/meteor-kitchen/kitchen-old/files/examples/
cp ~/meteor/meteor-kitchen/kitchen-cli/examples/example-photosharing/example-photosharing.json ~/meteor/meteor-kitchen/kitchen-old/files/examples/
cp ~/meteor/meteor-kitchen/kitchen-cli/examples/example-iot/example-iot.json ~/meteor/meteor-kitchen/kitchen-old/files/examples/
cp ~/meteor/meteor-kitchen/kitchen-cli/examples/example-geiger/example-geiger.json ~/meteor/meteor-kitchen/kitchen-old/files/examples/

meteor-kitchen --metadata ~/meteor/meteor-kitchen/kitchen-base/source/metadata.json
meteor-kitchen --metadata ~/meteor/meteor-kitchen/kitchen-old/files/metadata.json

cd ~/meteor/
~/meteor/meteor-kitchen/kitchen-docs/Release/kitchen-docs
meteor-kitchen ~/meteor/meteor-kitchen/kitchen-old/meteor-kitchen.json ./kitchen-old $METEOR_RELEASE

cd ~/meteor/meteor-kitchen/kitchen-base/
node ~/meteor/meteor-kitchen/kitchen-base/converter.js


cd ~/meteor/

cp -R ~/meteor/meteor-kitchen/kitchen-cli/examples/ ./kitchen-examples/
rm -f ./kitchen-examples/example-human2machine/files/settings.json

cp -R ~/meteor/meteor-kitchen/kitchen-old/ ./kitchen-site/
rm -f ./kitchen-site/files/settings.json
rm -f ./kitchen-site/files/mup.json

# COPY INSTALL SCRIPTS TO THE NEW GUI
cd ~/meteor/meteor-kitchen/
cp ./kitchen-cli/install/install.sh ./kitchen-gui/private/install.sh
cp ./kitchen-cli/install/install_linux.tar.gz ./kitchen-gui/public/install/install_linux.tar.gz
cp ./kitchen-cli/install/install_mac.tar.gz ./kitchen-gui/public/install/install_mac.tar.gz
cp ./kitchen-cli/install/install_win.exe ./kitchen-gui/public/install/install_win.exe
cp ./kitchen-cli/install/google6ed5a62f5bad68d0.html ./kitchen-gui/public/google6ed5a62f5bad68d0.html


# CONVERT LAYOUT TEMPLATES TO GAS FOR NEW GUI
cd ~/meteor/meteor-kitchen/

TEMPLATE_DIRS="./kitchen-cli/templates/blaze/ui/*/"
for d in $TEMPLATE_DIRS
do
	FRAMEWORK_NAME=$(basename "${d}")
	FRAMEWORK_DIR="./kitchen-gui/private/public/templates/${FRAMEWORK_NAME}/layouts/"
	mkdir -p $FRAMEWORK_DIR
	TEMPLATE_FILES=${d}layouts/layout_content_*.html
	for f in $TEMPLATE_FILES
	do
		LAYOUT_FILENAME=$(basename "${f}")
		LAYOUT_NAKED_FILENAME=$(echo $LAYOUT_FILENAME | cut -f 1 -d '.')
		LAYOUT_NAME="${LAYOUT_NAKED_FILENAME:15}"

		echo "Converting layout template \"$f\"..."
		blaze2gasoline -i $f -o "${FRAMEWORK_DIR}${LAYOUT_NAME}.json" -w
	done
done

# CONVERT PAGE TEMPLATES TO GAS FOR NEW GUI
cd ~/meteor/meteor-kitchen/

TEMPLATE_DIRS="./kitchen-cli/templates/blaze/ui/*/"
for d in $TEMPLATE_DIRS
do
	FRAMEWORK_NAME=$(basename "${d}")
	FRAMEWORK_DIR="./kitchen-gui/private/public/templates/${FRAMEWORK_NAME}/pages/"
	mkdir -p $FRAMEWORK_DIR
	TEMPLATE_FILES=${d}pages/*.html
	for f in $TEMPLATE_FILES
	do
		PAGE_FILENAME=$(basename "${f}")
		PAGE_NAME=$(echo $PAGE_FILENAME | cut -f 1 -d '.')

		echo "Converting page template \"$f\"..."
		blaze2gasoline -i $f -o "${FRAMEWORK_DIR}${PAGE_NAME}.json" -w
	done
done


echo ""
echo "Don't forget to remove setup files from ./kitchen-site/meteor-kitchen.json :)"
