// Copyright 2017 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

describe('FractionInputValidationService', function() {
  var validatorService, WARNING_TYPES;

  var currentState;
  var answerGroups, goodDefaultOutcome, customizationArgs;
  var greaterThanMinusOneRule, equalsOneRule, equivalentToOneRule,
    lessThanTwoRule;
  var createFractionDict;
  beforeEach(function() {
    module('oppia');
  });

  beforeEach(inject(function($rootScope, $controller, $injector) {
    validatorService = $injector.get('FractionInputValidationService');

    WARNING_TYPES = $injector.get('WARNING_TYPES');

    createFractionDict = function(
      isNegative, wholeNumber, numerator, denominator) {
      return {
        isNegative: isNegative,
        wholeNumber: wholeNumber,
        numerator: numerator,
        denominator: denominator
      };
    };

    customizationArgs = {
      requireSimplestForm: {
        value: true
      }
    };

    currentState = 'First State';
    goodDefaultOutcome = {
      dest: 'Second State',
      feedback: {
        html: '',
        audio_translations: {}
      }
    };

    equalsOneRule = {
      type: 'IsExactlyEqualTo',
      inputs: {
        f: createFractionDict(false, 0, 1, 1)
      }
    };

    greaterThanMinusOneRule = {
      type: 'IsGreaterThan',
      inputs: {
        f: createFractionDict(true, 0, 1, 1)
      }
    };

    lessThanTwoRule = {
      type: 'IsLessThan',
      inputs: {
        f: createFractionDict(false, 0, 2, 1)
      }
    };

    equivalentToOneRule = {
      type: 'IsEquivalentTo',
      inputs: {
        f: createFractionDict(false, 0, 10, 10)
      }
    };

    equivalentToOneAndSimplestFormRule = {
      type: 'IsEquivalentToAndInSimplestForm',
      inputs: {
        f: createFractionDict(false, 0, 10, 10)
      }
    };

    exactlyEqualToOneAndNotInSimplestFormRule = {
      type: 'IsExactlyEqualTo',
      inputs: {
        f: createFractionDict(false, 0, 10, 10)
      }
    };

    nonIntegerRule = {
      type: 'HasNumeratorEqualTo',
      inputs: {
        x: 0.5
      }
    };

    zeroDenominatorRule = {
      type: 'HasDenominatorEqualTo',
      inputs: {
        x: 0
      }
    };

    answerGroups = [{
      rules: [equalsOneRule, lessThanTwoRule],
      outcome: goodDefaultOutcome,
      correct: false
    }];
  }));

  it('should be able to perform basic validation', function() {
    var warnings = validatorService.getAllWarnings(
      currentState, customizationArgs, answerGroups,
      goodDefaultOutcome);
    expect(warnings).toEqual([]);
  });

  it('should catch redundant rules', function() {
    answerGroups[0].rules = [lessThanTwoRule, equalsOneRule];
    var warnings = validatorService.getAllWarnings(
      currentState, customizationArgs, answerGroups,
      goodDefaultOutcome);
    expect(warnings).toEqual([{
      type: WARNING_TYPES.ERROR,
      message: 'Rule 2 from answer group 1 will never be matched ' +
        'because it is made redundant by rule 1 from answer group 1.'
    }]);
  });

  it('should catch identical rules as redundant', function() {
    answerGroups[0].rules = [equalsOneRule, equivalentToOneRule];
    var warnings = validatorService.getAllWarnings(
      currentState, customizationArgs, answerGroups,
      goodDefaultOutcome);
    expect(warnings).toEqual([{
      type: WARNING_TYPES.ERROR,
      message: 'Rule 2 from answer group 1 will never be matched ' +
        'because it is made redundant by rule 1 from answer group 1.'
    }]);
    answerGroups[0].rules = [equalsOneRule, equivalentToOneAndSimplestFormRule];
    var warnings = validatorService.getAllWarnings(
      currentState, customizationArgs, answerGroups,
      goodDefaultOutcome);
    expect(warnings).toEqual([{
      type: WARNING_TYPES.ERROR,
      message: 'Rule 2 from answer group 1 will never be matched ' +
        'because it is made redundant by rule 1 from answer group 1.'
    }]);
  });

  it('should catch redundant rules in separate answer groups', function() {
    answerGroups[1] = angular.copy(answerGroups[0]);
    answerGroups[0].rules = [greaterThanMinusOneRule];
    answerGroups[1].rules = [equalsOneRule];
    var warnings = validatorService.getAllWarnings(
      currentState, customizationArgs, answerGroups,
      goodDefaultOutcome);
    expect(warnings).toEqual([{
      type: WARNING_TYPES.ERROR,
      message: 'Rule 1 from answer group 2 will never be matched ' +
        'because it is made redundant by rule 1 from answer group 1.'
    }]);
  });

  it('should catch redundant rules caused by greater/less than range',
    function() {
      answerGroups[0].rules = [greaterThanMinusOneRule, equalsOneRule];
      var warnings = validatorService.getAllWarnings(
        currentState, customizationArgs, answerGroups,
        goodDefaultOutcome);
      expect(warnings).toEqual([{
        type: WARNING_TYPES.ERROR,
        message: 'Rule 2 from answer group 1 will never be matched ' +
          'because it is made redundant by rule 1 from answer group 1.'
      }]);
    });

  it('should catch redundant rules caused by exactly equals', function() {
    answerGroups[0].rules = [exactlyEqualToOneAndNotInSimplestFormRule];
    var warnings = validatorService.getAllWarnings(
      currentState, customizationArgs, answerGroups,
      goodDefaultOutcome);
    expect(warnings).toEqual([{
      type: WARNING_TYPES.ERROR,
      message: 'Rule 1 from answer group 1 will never be matched ' +
        'because it is not in simplest form.'
    }]);
  });

  it('should catch non integer inputs in the numerator', function() {
    answerGroups[0].rules = [nonIntegerRule];
    var warnings = validatorService.getAllWarnings(
      currentState, customizationArgs, answerGroups,
      goodDefaultOutcome);
    expect(warnings).toEqual([{
      type: WARNING_TYPES.ERROR,
      message: (
        'Rule ' + 1 + ' from answer group ' +
        1 + ' is invalid: input should be an ' +
        'integer.')
    }]);
  });

  it('should catch non integer inputs in the whole number', function() {
    nonIntegerRule.type = 'HasIntegerPartEqualTo';
    answerGroups[0].rules = [nonIntegerRule];
    var warnings = validatorService.getAllWarnings(
      currentState, customizationArgs, answerGroups,
      goodDefaultOutcome);
    expect(warnings).toEqual([{
      type: WARNING_TYPES.ERROR,
      message: (
        'Rule ' + 1 + ' from answer group ' +
        1 + ' is invalid: input should be an ' +
        'integer.')
    }]);
  });

  it('should catch non integer inputs in the denominator', function() {
    nonIntegerRule.type = 'HasDenominatorEqualTo';
    answerGroups[0].rules = [nonIntegerRule];
    var warnings = validatorService.getAllWarnings(
      currentState, customizationArgs, answerGroups,
      goodDefaultOutcome);
    expect(warnings).toEqual([{
      type: WARNING_TYPES.ERROR,
      message: (
        'Rule ' + 1 + ' from answer group ' +
        1 + ' is invalid: input should be an ' +
        'integer.')
    }]);
  });

  it('should catch zero input in denominator', function() {
    answerGroups[0].rules = [zeroDenominatorRule];
    var warnings = validatorService.getAllWarnings(
      currentState, customizationArgs, answerGroups,
      goodDefaultOutcome);
    expect(warnings).toEqual([{
      type: WARNING_TYPES.ERROR,
      message: (
        'Rule ' + 1 + ' from answer group ' +
        1 + ' is invalid: denominator should be ' +
        'greater than zero.')
    }]);
  });
});
