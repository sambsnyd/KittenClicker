import com.moowork.gradle.node.task.NodeTask

plugins {
    id("com.moowork.node").version("1.3.1")
}

// manually kept in sync with manifest for now
val version = "1.0"
val scriptName = "kittenclicker"
val artifactName = "$scriptName-$version.zip"
val artifactsDir = File(buildDir, "artifacts")
val bundle = File(artifactsDir, artifactName)
val srcDir = file("src")
val secretsFile = file("secrets.properties")
val webExtFile = file("node_modules/web-ext/bin/web-ext")

tasks {

    val assemble = register("assemble", NodeTask::class.java) {
        description = "build extension without signing"
        inputs.dir(srcDir)
        outputs.file(bundle)
        dependsOn(named("npmInstall"))

        setScript(webExtFile)
        setArgs(listOf("build", "--source-dir", srcDir.absolutePath, "--artifacts-dir", artifactsDir.absolutePath, "--overwrite-dest"))
    }

    val sign = register("sign", NodeTask::class.java) {
        description = "build and sign extension"
        val secrets: java.util.Properties = secretsFile.inputStream().use {
            java.util.Properties().apply {
                load(it)
            }
        }

        inputs.dir(srcDir)
        inputs.file(secretsFile)
        outputs.file(bundle)
        dependsOn(named("npmInstall"))

        setScript(webExtFile)
        setArgs(listOf("sign",
                "--source-dir", srcDir,
                "--artifacts-dir", artifactsDir,
                "--api-key", secrets["jwtIssuer"],
                "--api-secret", secrets["jwtSecret"]))
    }

    val run = register("run", NodeTask::class.java) {
        setScript(webExtFile)
        setArgs(listOf("sign",
                "--source-dir", srcDir,
                "--artifacts-dir", artifactsDir))
    }

    val clean = register("clean", Delete::class.java) {
        delete(buildDir)
        delete("node_modules")
    }
}
