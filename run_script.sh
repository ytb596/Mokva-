#!/bin/bash

# Tối ưu Node.js và chạy file index.js
time node --no-deprecation --no-warnings --optimize_for_size --max-old-space-size=150 --gc-interval=50 --noconcurrent_recompilation --noincremental_marking --async-stack-traces index.js
