description: "Repair planning invariants and report status (dalton-2)"

# ARGV

- Input: raw $ARGUMENTS. Optional flag: --autofix.
- Defaults: autofix=true.
- First line:
  ARGV {"autofix":<true|false>,"raw":"$ARGUMENTS"}
- Print ARGV once; no narration.

# Flow

1. @invariant_checker [--autofix] → must print exactly one:
   - HEALTH ok
   - HEALTH repaired: <comma-separated fixes>
   - SPEC_GAP unrecoverable: <reason>

# Markers

- START doctor
- [HEALTH ok | HEALTH repaired: ... | SPEC_GAP unrecoverable: ...]
- DONE doctor

# IO

- Command itself does not edit; fixes happen inside invariant_checker when --autofix.
