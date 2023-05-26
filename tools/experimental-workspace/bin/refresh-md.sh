#!/bin/bash

SCRIPTDIR=`dirname $0`
ROOTDIR="${SCRIPTDIR}/.."

EXPORTER="${ROOTDIR}/node_modules/.bin/gdc-catalog-export"
OUTPUT="${ROOTDIR}/src/md/full.ts"

$EXPORTER \
  --backend bear \
  --hostname "staging3.intgdc.com" \
  --workspace-id "d79dpgty2b4ydewi6kbzqm4fq1be2ltm" \
  --accept-untrusted-ssl \
  --output "${OUTPUT}"
