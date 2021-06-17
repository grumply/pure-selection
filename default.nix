{ mkDerivation, stdenv, ghc, base, ghcjs-base, pure-core, pure-events, pure-txt, 
  pure-lifted, pure-parse, pure-transform
}:
mkDerivation {
  pname = "pure-parse";
  version = "0.8.0.0";
  src = ./.;
  libraryHaskellDepends = 
    [ base pure-core pure-events pure-txt pure-lifted pure-parse 
      pure-transform 
    ];
  homepage = "github.com/grumply/pure-parse";
  license = stdenv.lib.licenses.bsd3;
}
