window.onload = function () {

    var teclas = document.getElementsByTagName("input");
    var num1 = "", num2 = "", op = "";
    for (var i = 1; i < teclas.length; i++) {
        teclas[i].onclick = function () {
            var pantalla = document.getElementById("pantalla");

            if (num1 == "") {
                //leo numero 1
                
                if (this.value != '+' && this.value != '-' && this.value != '*' && this.value != '/' && this.value != "=") {
                    pantalla.value = pantalla.value + this.value;
                } else {

                    num1 = pantalla.value;
                    op = this.value;
                    if (op == "=") {
                        pantalla.value = num1;
                        num1 = "";
                        op = "";
                    } else {
                        pantalla.value = "";
                    }


                }

            } else {
                //leo número 2
                if (this.value != '+' && this.value != '-' && this.value != '*' && this.value != '/' && this.value != "=") {
                    pantalla.value = pantalla.value + this.value;
                } else {
                    if (this.value == "=") {
                        num2 = parseInt(pantalla.value);
                        num1 = parseInt(num1);
                        var resultado;

                        switch (op) {
                            case "+":
                                resultado = num1 + num2;
                                break;
                            case "*":
                                resultado = num1 * num2;
                                break;
                            case "/":
                                resultado = num1 / num2;
                                break;
                            case "-":
                                resultado = num1 - num2;
                                break;
                        }

                        pantalla.value = resultado;
                    }

                }

            }





        }
    }



};  