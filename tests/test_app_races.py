import shutil
import subprocess
import unittest
from pathlib import Path


@unittest.skipUnless(shutil.which('node'), 'node is needed for browser-script race tests')
class AppRaceTests(unittest.TestCase):
    def test_delayed_assessments_and_snapshot_changes(self):
        # Runs the actual app.js with controlled network timing and a minimal DOM.
        # This checks behavior, not layout or a real browser engine.
        runner = Path(__file__).with_name('app_races.js')
        result = subprocess.run(['node', str(runner)], capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)


if __name__ == '__main__':
    unittest.main()
