export function ruleAccount(){
    var status = $$('.rule')
    status.forEach((element, index) => {
        content = element.querySelector('div')
        console.log(content)
        if(content?.innerHTML == 'Bán hàng'){
            content?.classList.add('shop')
        }
        else{
            content.classList.add('shipper')

        }
    });
}