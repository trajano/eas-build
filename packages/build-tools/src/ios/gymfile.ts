import path from 'path';

import templateFile from '@expo/template-file';
import { Ios } from '@expo/eas-build-job';

import { Credentials } from './credentials/manager';

const ARCHIVE_TEMPLATE_FILE_PATH = path.join(__dirname, '../../templates/Gymfile.archive.template');
const SIMULATOR_TEMPLATE_FILE_PATH = path.join(
  __dirname,
  '../../templates/Gymfile.simulator.template'
);

interface ArchiveBuildOptions {
  outputFile: string;
  credentials: Credentials;
  scheme: string;
  schemeBuildConfiguration?: Ios.SchemeBuildConfiguration;
  outputDirectory: string;
  clean: boolean;
}

interface SimulatorBuildOptions {
  outputFile: string;
  scheme: string;
  schemeBuildConfiguration?: Ios.SchemeBuildConfiguration;
  derivedDataPath: string;
  clean: boolean;
}

export async function createGymfileForArchiveBuild({
  outputFile,
  clean,
  credentials,
  scheme,
  schemeBuildConfiguration,
  outputDirectory,
}: ArchiveBuildOptions): Promise<void> {
  const PROFILES = [];
  const targets = Object.keys(credentials.targetProvisioningProfiles);
  for (const target of targets) {
    const profile = credentials.targetProvisioningProfiles[target];
    PROFILES.push({
      BUNDLE_ID: profile.bundleIdentifier,
      UUID: profile.uuid,
    });
  }

  await createGymfile({
    template: ARCHIVE_TEMPLATE_FILE_PATH,
    outputFile,
    vars: {
      KEYCHAIN_PATH: credentials.keychainPath,
      SCHEME: scheme,
      SCHEME_BUILD_CONFIGURATION: schemeBuildConfiguration,
      OUTPUT_DIRECTORY: outputDirectory,
      EXPORT_METHOD: credentials.distributionType,
      CLEAN: String(clean),
      PROFILES,
    },
  });
}

export async function createGymfileForSimulatorBuild({
  outputFile,
  clean,
  scheme,
  schemeBuildConfiguration,
  derivedDataPath,
}: SimulatorBuildOptions): Promise<void> {
  await createGymfile({
    template: SIMULATOR_TEMPLATE_FILE_PATH,
    outputFile,
    vars: {
      SCHEME: scheme,
      SCHEME_BUILD_CONFIGURATION: schemeBuildConfiguration,
      DERIVED_DATA_PATH: derivedDataPath,
      CLEAN: String(clean),
    },
  });
}

async function createGymfile({
  template,
  outputFile,
  vars,
}: {
  template: string;
  outputFile: string;
  vars: Record<string, string | number | any>;
}): Promise<void> {
  await templateFile(template, vars, outputFile, { mustache: false });
}