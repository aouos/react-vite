/**
 * Ambient type declarations shared across the rv CLI's JavaScript sources, used only by
 * `tsc --checkJs` (see tsconfig.json). This file emits no runtime output; it exists so JSDoc
 * annotations like `@param {Features} features` are checked against real shapes.
 *
 * These types are global on purpose (no top-level import/export) so every `.js` file can
 * reference them without an `import(...)` dance.
 */

/** Map of canonical feature key to its enabled flag. */
type Features = {
  typescript: boolean;
  tailwind: boolean;
  router: boolean;
  eslint: boolean;
  zustand: boolean;
  shadcn: boolean;
};

/** A canonical feature key. */
type FeatureKey = keyof Features;

/** One optional feature's prompt/CLI metadata (features.js FEATURE_DEFINITIONS). */
type FeatureDefinition = {
  key: FeatureKey;
  name: string;
  description: string;
  aliases: string[];
};

/** A generated file: destination path (relative to the project) and its full contents. */
type TemplateFile = {
  path: string;
  contents: string;
};

/** A package.json object — only the fields rv reads or writes are named; the rest pass through. */
type PackageJson = {
  name?: string;
  private?: boolean;
  version?: string;
  type?: string;
  engines?: Record<string, string>;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: unknown;
};

/**
 * A generated package.json — buildGeneratedPackageJson always populates these maps, so
 * they are required here (unlike the all-optional PackageJson) and can be safely iterated.
 */
type GeneratedPackageJson = PackageJson & {
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
};

/** Inputs shared by buildProjectPlan and scaffoldProject (and the command layer). */
type ProjectContext = {
  targetDir: string;
  projectName: string;
  features: Features;
  mode: 'create' | 'init';
};

/** The write plan produced by buildProjectPlan (before anything touches disk). */
type ProjectPlan = {
  templateFiles: TemplateFile[];
  packageFile: TemplateFile;
  packageJson: PackageJson;
  packageJsonMerged: boolean;
};

/** One template-managed dependency whose declared version differs from the rv pin. */
type DependencyDrift = {
  packageName: string;
  declared: string;
  pinned: string;
};

/** An anchor-file probe result (doctor.js findAnchorFile). */
type AnchorFile = {
  file: string;
  hasAnchor: boolean;
};

/** The project health report produced by collectDiagnostics (doctor.js). */
type Diagnostics = {
  isReactViteProject: boolean;
  nodeVersion: string;
  nodeSupported: boolean;
  drift: DependencyDrift[];
  router: AnchorFile | null;
  layout: AnchorFile | null;
};

/** The outcome of scaffoldProject. */
type ScaffoldResult = {
  cancelled: boolean;
  written: string[];
  skipped: string[];
  packageJsonMerged: boolean;
};
