# coding: utf-8
#
# Copyright 2016 The Oppia Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS-IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""Provides app identity services."""

from google.appengine.api import app_identity


def get_application_id():
    """Returns the application's App Engine ID.

    For more information, see
    https://cloud.google.com/appengine/docs/python/appidentity/

    Returns:
        str. The application ID.
    """
    return app_identity.get_application_id()

def get_default_gcs_bucket_name():
    """Returns the application's default Google Cloud Storage bucket"""

    return app_identity.get_default_gcs_bucket_name()