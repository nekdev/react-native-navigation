/* tslint:disable: no-console */
const exec = require('shell-utils').exec;
const semver = require('semver');
const fs = require('fs');
const _ = require('lodash');

<<<<<<< HEAD
function execSync(cmd) {
  cp.execSync(cmd, { stdio: ['inherit', 'inherit', 'inherit'] });
}

function execSyncRead(cmd) {
  return String(cp.execSync(cmd, { stdio: ['inherit', 'pipe', 'inherit'] })).trim();
}

function execSyncSilently(cmd) {
  cp.execSync(cmd, { stdio: ['ignore', 'ignore', 'ignore'] });
=======
const ONLY_ON_BRANCH = 'origin/v2';
const VERSION_TAG = 'alpha';
const VERSION_INC = 'patch';

function run() {
  if (!validateEnv()) {
    return;
  }
  setupGit();
  createNpmRc();
  versionTagAndPublish();
>>>>>>> fe6db481607ed06cf96fe2d675aea667921ce051
}

function validateEnv() {
  if (!process.env.JENKINS_CI) {
    throw new Error(`releasing is only available from CI`);
  }

  if (!process.env.JENKINS_MASTER) {
    console.log(`not publishing on a different build`);
<<<<<<< HEAD
=======
    return false;
  }

  if (process.env.GIT_BRANCH !== ONLY_ON_BRANCH) {
    console.log(`not publishing on branch ${process.env.GIT_BRANCH}`);
>>>>>>> fe6db481607ed06cf96fe2d675aea667921ce051
    return false;
  }

  return true;
}

function setupGit() {
  exec.execSyncSilent(`git config --global push.default simple`);
  exec.execSyncSilent(`git config --global user.email "${process.env.GIT_EMAIL}"`);
  exec.execSyncSilent(`git config --global user.name "${process.env.GIT_USER}"`);
  const remoteUrl = new RegExp(`https?://(\\S+)`).exec(exec.execSyncRead(`git remote -v`))[1];
  exec.execSyncSilent(`git remote add deploy "https://${process.env.GIT_USER}:${process.env.GIT_TOKEN}@${remoteUrl}"`);
  exec.execSync(`git checkout ${ONLY_ON_BRANCH}`);
}

<<<<<<< HEAD
function calcNewVersion() {
  const latestVersion = execSyncRead(`npm view ${process.env.npm_package_name}@latest version`);
  console.log(`latest version is: ${latestVersion}`);
  console.log(`package version is: ${process.env.npm_package_version}`);
  if (semver.gt(process.env.npm_package_version, latestVersion)) {
    return semver.inc(process.env.npm_package_version, 'patch');
  } else {
    return semver.inc(latestVersion, 'patch');
  }
}

function copyNpmRc() {
  execSync(`rm -f package-lock.json`);
  const npmrcPath = p.resolve(`${__dirname}/.npmrc`);
  execSync(`cp -rf ${npmrcPath} .`);
}

function tagAndPublish(newVersion) {
  console.log(`new version is: ${newVersion}`);
  execSync(`npm version ${newVersion} -m "v${newVersion} [ci skip]"`);
  execSync(`npm publish --tag latest`);
  execSyncSilently(`git push deploy --tags`);
=======
function createNpmRc() {
  exec.execSync(`rm -f package-lock.json`);
  const content = `
email=\${NPM_EMAIL}
//registry.npmjs.org/:_authToken=\${NPM_TOKEN}
`;
  fs.writeFileSync(`.npmrc`, content);
}

function versionTagAndPublish() {
  const packageVersion = semver.clean(process.env.npm_package_version);
  console.log(`package version: ${packageVersion}`);

  const currentPublished = findCurrentPublishedVersion();
  console.log(`current published version: ${currentPublished}`);

  const version = semver.gt(packageVersion, currentPublished) ? packageVersion : semver.inc(currentPublished, VERSION_INC);
  tryPublishAndTag(version);
}

function findCurrentPublishedVersion() {
  return exec.execSyncRead(`npm view ${process.env.npm_package_name} dist-tags.${VERSION_TAG}`);
>>>>>>> fe6db481607ed06cf96fe2d675aea667921ce051
}

function tryPublishAndTag(version) {
  let theCandidate = version;
  for (let retry = 0; retry < 5; retry++) {
    try {
      tagAndPublish(theCandidate);
      console.log(`Released ${theCandidate}`);
      return;
    } catch (err) {
      const alreadyPublished = _.includes(err.toString(), 'You cannot publish over the previously published version');
      if (!alreadyPublished) {
        throw err;
      }
      console.log(`previously published. retrying with increased ${VERSION_INC}...`);
      theCandidate = semver.inc(theCandidate, VERSION_INC);
    }
  }
}

function tagAndPublish(newVersion) {
  console.log(`trying to publish ${newVersion}...`);
  exec.execSync(`npm --no-git-tag-version version ${newVersion}`);
  exec.execSyncRead(`npm publish --tag ${VERSION_TAG}`);
  exec.execSync(`git tag -a ${newVersion} -m "${newVersion}"`);
  exec.execSyncSilent(`git push deploy ${newVersion} || true`);
}

run();
