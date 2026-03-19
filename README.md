# rouge_down_100_cc
仙人洞府探秘100层

## GitHub Pages 发布

仓库已包含自动发布工作流：[.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml)。

首次启用时只需要做一次仓库设置：

1. 打开 GitHub 仓库的 `Settings -> Pages`。
2. 在 `Source` 里选择 `GitHub Actions`。
3. 之后把 `build/web-mobile` 的更新提交到 `main`，站点会自动发布到：`https://linanjun.github.io/rouge_down_100_cc/build/web-mobile/`。

这个工作流会在发布前自动创建 `build/web-mobile/.nojekyll`，避免 GitHub Pages/Jekyll 忽略 Cocos 生成的 `_virtual_cc-*.js` 运行时文件。
