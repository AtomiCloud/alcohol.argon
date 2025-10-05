{ pkgs, packages }:
with packages;
{
  system = [
    atomiutils
  ];

  dev = [
    pls
    git
  ];

  main = [
    bun
    infisical
    pngquant
  ];

  lint = [
    # core
    treefmt
    gitlint
    shellcheck
    sg
  ];

  releaser = [
    sg
  ];

}
