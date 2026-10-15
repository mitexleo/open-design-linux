import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
	CMS_HOST_RELEASE_INPUTS,
	cmsHostReleaseFingerprint,
	resolveCmsHostReleaseFingerprint,
} from "../../next.config";

const workspaceRoot = resolve(process.cwd(), "../..");
const readCmsHostReleaseInput = (
	file: (typeof CMS_HOST_RELEASE_INPUTS)[number],
) => readFileSync(resolve(workspaceRoot, file));

describe("CMS host release fingerprint", () => {
	it("is stable for identical host sources", () => {
		expect(cmsHostReleaseFingerprint(readCmsHostReleaseInput)).toBe(
			cmsHostReleaseFingerprint(readCmsHostReleaseInput),
		);
	});

	it.each(CMS_HOST_RELEASE_INPUTS)(
		"changes when host input %s changes",
		(changedFile) => {
			const baseline = cmsHostReleaseFingerprint(readCmsHostReleaseInput);
			const changedHost = cmsHostReleaseFingerprint((file) =>
				file === changedFile
					? Buffer.concat([
							readCmsHostReleaseInput(file),
							Buffer.from("\n/* changed */"),
						])
					: readCmsHostReleaseInput(file),
			);

			expect(changedHost).not.toBe(baseline);
		},
	);
});

describe("resolveCmsHostReleaseFingerprint", () => {
	const webRoot = resolve(workspaceRoot, "apps/web");

	it("computes the fingerprint when the monorepo sources are present", () => {
		expect(resolveCmsHostReleaseFingerprint(webRoot, workspaceRoot)).toMatch(
			/^sha256:[0-9a-f]{64}$/,
		);
	});

	it("returns undefined when the monorepo sources are absent (packaged server)", () => {
		// A packaged web sidecar resolves WORKSPACE_ROOT to node_modules, where
		// `apps/web/app/layout.tsx` does not exist. Reading it there threw ENOENT
		// while Next loaded the config, which killed the web sidecar and the app.
		const emptyRoot = mkdtempSync(join(tmpdir(), "od-cms-host-"));
		expect(resolveCmsHostReleaseFingerprint(emptyRoot, emptyRoot)).toBeUndefined();
	});
});
