const socket = io()


//elements
const $form = document.querySelector('#messageform')
const $messageFormInput = $form.querySelector('#input')
const $messageFormButton = $form.querySelector('button')
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')
 
//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => {
    //new message
    const $newMessage = $messages.lastElementChild
    
    //height of new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom) 
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //height of messages container
    const contentHeight = $messages.scrollHeight

    //how far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(contentHeight - newMessageHeight <= scrollOffset+1){
        $messages.scrollTop = $messages.scrollHeight
    }
    
}

socket.on('message', (message) => {
    
    const html = Mustache.render(messageTemplate, {
        message: message.text, 
        createdAt: moment(message.createdAt).format('h:mma'),
        username: message.username || "(k)NackBot"
    })
    $messages.insertAdjacentHTML('beforeEnd', html)
    autoscroll()
}) 
 
socket.on('locationMessage', (locationData) => {
    const html = Mustache.render(locationTemplate, {
        url: locationData.url, 
        createdAt: moment(locationData.createdAt).format('h:mma'),
        username: locationData.username || "(k)NackBot"
    })
    $messages.insertAdjacentHTML('beforeEnd', html)
    autoscroll()
}) 

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {room, users})
    $sidebar.innerHTML = html
} )

$form.addEventListener('submit', (e) => {
    e.preventDefault()
    $messageFormButton.setAttribute('disabled', 'disabled')
    let input = e.target.elements.message
     //disable form
    let toBeSent = input.value
    socket.emit('sent', toBeSent, (error) => {
       //enable form
       $messageFormButton.removeAttribute('disabled')
       $messageFormInput.value = ''
       $messageFormInput.focus()
       if(error) return alert(error);
       console.log("Message Delivered")
    })
})

$locationButton.addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert("Geolocation is not supported by your browser")
    }
    $locationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords
        socket.emit('sendLocation', {
            latitude,
            longitude
        }, (message) => {
            $locationButton.removeAttribute('disabled')
            
        })
    })
})

socket.emit('join', {username, room}, (error) => {
     if(error){
         alert(error)
         location.href ="/"
     }
})