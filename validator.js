//đối tượng
function Validator(options) {
  // lấy thẻ cha input

  function getParent(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }
      element = element.parentElement;
    }
  }
  const selectorRules = {};
  //hàm lấy error element
  function getElement(inputElement, errMessage) {
    const errElement = getParent(
      inputElement,
      options.formSelector
    ).querySelector(options.errorSelector);
    return errMessage
      ? (errElement.innerText = errMessage)
      : (errElement.innerText = "");
  }
  // hàm thực hiện validate form
  function validate(inputElement, rule) {
    let errMessage;
    // lấy ra các rule của selector
    const rules = selectorRules[rule.selector];

    //lặp qua từng rule và kiểm tra
    //nếu có lỗi thì dừng
    for (let i = 0; i < rules.length; i++) {
      switch (inputElement.type) {
        case "radio":
        case "checkbox":
          errMessage = rules[i](
            formElement.querySelector(rule.selector + ":checked")
          );
          break;
        default:
          errMessage = rules[i](inputElement.value);
      }
      if (errMessage) break;
    }
    getElement(inputElement, errMessage);
    return !errMessage;
  }
  //lấy element form
  const formElement = document.querySelector(options.form);
  if (formElement) {
    formElement.onsubmit = function (e) {
      e.preventDefault();
      let isFormValid = true;
      //lặp qua từng rule và validate
      options.rules.forEach((rule) => {
        const inputElement = formElement.querySelector(rule.selector);
        const isValid = validate(inputElement, rule);
        if (!isValid) {
          isFormValid = false;
        }
      });
      if (isFormValid) {
        //TH submit vs javascript
        if (typeof options.onSubmit == "function") {
          const dataForm = formElement.querySelectorAll(
            "[name]:not( [disabled] )"
          );
          const formValue = Array.from(dataForm).reduce((values, input) => {
            switch (input.type) {
              case "checkbox":
                if (!input.matches(":checked")) {
                  values[input.name] = "";
                  return values;
                }
                if (!Array.isArray(values[input.name])) {
                  values[input.name] = [];
                }

                values[input.name].push(input.value);
                break;
              case "radio":
                values[input.name] = formElement.querySelector(
                  'input[name="' + input.name + '"]:checked'
                ).value;
                break;
              case "file":
                values[input.name] = input.files;
                break;
              default:
                values[input.name] = input.value;
            }
            return values;
          }, {});
          options.onSubmit(formValue);
        }
        //TH hành vi mặc định
        else {
          formElement.submit();
        }
      } else {
        console.log("có lỗi");
      }
    };

    // lặp qua rule và xử lí
    options.rules.forEach((rule) => {
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        selectorRules[rule.selector] = [rule.test];
      }

      const inputElements = formElement.querySelectorAll(rule.selector);
      Array.from(inputElements).forEach((inputElement) => {
        if (inputElement) {
          //  xử lí TH blur ra ngoài input
          inputElement.onblur = function () {
            validate(inputElement, rule);
          };

          // xử lí TH người dùng nhập input

          inputElement.oninput = function () {
            getElement(inputElement, undefined);
          };
        }
      });
    });
  }
}
//định nghĩa các rules
Validator.isRequired = function (selector, message) {
  return {
    selector,
    test: function (value) {
      return value ? undefined : message || "(*) Vui lòng nhập trường này";
    },
  };
};

Validator.isEmail = function (selector, message) {
  return {
    selector,
    test: function (value) {
      const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value)
        ? undefined
        : message || "(*) Trường này phải là email";
    },
  };
};
1;

Validator.minLength = function (selector, min, message) {
  return {
    selector,
    test: function (value) {
      return value.length >= min
        ? undefined
        : message || `(*) Vui lòng nhập tối thiểu ${min} kí tự`;
    },
  };
};

Validator.isConfirmed = function (selector, getValue, message) {
  return {
    selector,
    test: function (value) {
      return value == getValue()
        ? undefined
        : message || "Giá trị nhập vào không chính xác";
    },
  };
};
