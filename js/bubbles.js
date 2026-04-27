var _bubbleCount = 0;
var _maxBubbles  = 8;

function createBubble() {
    if (_bubbleCount >= _maxBubbles) return;
    const section = document.querySelector('section');
    if (!section) return;
    const el = document.createElement('span');
    el.className = 'bubble-anim';
    var size = Math.random() * 60;
    el.style.width  = 20 + size + 'px';
    el.style.height = 20 + size + 'px';
    el.style.left   = Math.random() * innerWidth + 'px';
    el.style.willChange = 'transform, opacity';
    section.appendChild(el);
    _bubbleCount++;
    setTimeout(() => {
        el.remove();
        _bubbleCount--;
    }, 4000);
}

setInterval(createBubble, 400);