from photon_platform.publish.global_conf import *
import geometor.explorer as module

version = module.__version__

org = "geometor"
org_name = "GEOMETOR"

repo = "explorer"
repo_name = "explorer"

setup_globals(org, org_name, repo, repo_name)
site_title = "Interactive Geometry Explorer"
project = site_title
html_title = f"{site_title} • {org_name}"
