import m from 'mithril';
import tagl from 'tagl-mithril';
const { div, p, button, textarea } = tagl(m);
const { random } = Math;

const draggable = vnode => {
    var pos1 = 0,
        pos2 = 0,
        pos3 = 0,
        pos4 = 0;
    return {
        oncreate: vnode => {

            const { ix, iy, onfinished, deg } = vnode.attrs;

            const closeDragElement = () => {
                // stop moving when mouse button is released:
                document.onmouseup = null;
                document.onmousemove = null;
            };

            vnode.dom.style.top = `${iy}px`;
            vnode.dom.style.left = `${ix}px`;

            console.log(deg)

            vnode.dom.style.webkitTransform = 'rotate(' + deg + 'deg)';
            vnode.dom.style.mozTransform = 'rotate(' + deg + 'deg)';
            vnode.dom.style.msTransform = 'rotate(' + deg + 'deg)';
            vnode.dom.style.oTransform = 'rotate(' + deg + 'deg)';
            vnode.dom.style.transform = 'rotate(' + deg + 'deg)';

            const elementDrag = e => {
                e = e || window.event;
                e.preventDefault();
                // calculate the new cursor position:
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;
                onfinished && onfinished(
                    (vnode.dom.offsetLeft - pos1),
                    (vnode.dom.offsetTop - pos2)
                );
                // set the element's new position:
                vnode.dom.style.top = (vnode.dom.offsetTop - pos2) + "px";
                vnode.dom.style.left = (vnode.dom.offsetLeft - pos1) + "px";
            };

            const dragger = vnode.dom.querySelector('#mydivheader');
            console.log(vnode.dom)
            dragger.onmousedown = (e) => {
                e = e || window.event;
                e.preventDefault();
                // get the mouse cursor position at startup:
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                // call a function whenever the cursor moves:
                document.onmousemove = elementDrag;
            }
        },
        view: ({ children, attrs: { ondelete } }) => div.postit({ "id": "mydiv" }, [
            div.toolbar(
                button({ onclick: ondelete }, '🗑️')
            ),
            div({ "id": "mydivheader" },
                '_' || "💎"
            ),
            children
        ])
    };
};

const use = (v, fn) => fn(v);

const tryParse = v => {
    try {
        return JSON.parse(v);
    } catch (error) {
        return undefined;
    }
};

const load = () =>
    use(localStorage.getItem('zettels'),
        zettels => tryParse(zettels) || []);

let zettels = load();

const save = () =>
    localStorage.setItem('zettels', JSON.stringify(zettels));

const editableTextarea = vnode => {
    let edit = false;
    let text_ = vnode.attrs.text;
    return {
        oncreate: ({ attrs: { text } }) => {
            text_ = text
        },
        view: ({ attrs: { onsave } }) => !edit ? div({ onclick: e => edit = true }, text_.toUpperCase()) : [
            [
                textarea({
                    value: text_,
                    oninput: e => use(e.target.value, text => {
                        text_ = text;
                        onsave(text);
                    })
                }),
                button({ onclick: e => edit = false }, 'save')
            ]
        ]
    };
};

m.mount(document.body, {
    view: vnode => [
        button.addbutton({
            onclick: e => {
                zettels.push({ text: 'Neuer Zettel', ix: random() * innerWidth - 100, iy: random() * innerHeight - 100, deg: random() * 20 - 10, time: Date.now() });
                save();
            }
        }, '➕'),
        zettels.map((zettel, idx) =>
            m(draggable, {
                    ondelete: () => {
                        console.log(zettels, idx)
                        zettels = zettels.filter(z => z.time !== zettel.time);
                        console.log(zettels)
                    },
                    onfinished: (x, y) => {
                        zettel.ix = x;
                        zettel.iy = y;
                        save();
                    },
                    key: zettel.time,
                    ix: zettel.ix,
                    iy: zettel.iy,
                    deg: zettel.deg
                },
                m(editableTextarea, { text: zettel.text, onsave: t => zettel.text = t })
            )
        )
    ]
})