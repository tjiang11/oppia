oppia.factory('LanguageManagerService',
  ['$modal', 'ExplorationPlayerStateService',
  function($modal, ExplorationPlayerStateService) {
    var _currentAudioLanguageCode = null;
    var _allLanguageCodesInExploration = null;

    var _init = function() {
      _allLanguageCodesInExploration =
        ExplorationPlayerStateService.getAllAudioLanguageCodes();
      console.log(_allLanguageCodesInExploration);
      if (_allLanguageCodesInExploration.length == 1) {
        _currentAudioLanguageCode = _allLanguageCodesInExploration[0];
      }
      if (_allLanguageCodesInExploration.length > 1) {
        showPickLanguageModal();
      }
    };

    var showPickLanguageModal = function() {
      $modal.open({
          templateUrl: 'modals/takeBreak',
          backdrop: 'static',
          resolve: {},
          controller: [
            '$scope', '$modalInstance',
            function($scope, $modalInstance) {
              $scope.okay = function() {
                $modalInstance.close('okay');
              };
            }]
        });
    };

    return {
      init: function() {
        _init();
      },
      getCurrentAudioLanguageCode() {
        return _currentAudioLanguageCode;
      }
    };
  }
]);
