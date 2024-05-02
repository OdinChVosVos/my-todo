let canvas = document.getElementById("canvas")
let context = canvas.getContext("2d")

const nodes_body = document.getElementById("nodes_body")

canvas.width = window.innerWidth -100
canvas.height = window.innerHeight -200 

canvas.style.border = '3px inset lightblue'

let canvas_width = canvas.width
let canvas_height = canvas.height
let offset_x
let offset_y

let get_offset = function() {
    let canvas_offsets = canvas.getBoundingClientRect()
    offset_x = canvas_offsets.left
    offset_y = canvas_offsets.top
}

get_offset();
window.onscroll = function() {get_offset()}
window.onresize = function() {get_offset()}
canvas.onresize = function() {get_offset()}




let shapes = []
let matrix = [
    [0, 1],
    [1, 0]
]
let cur_shape_index = null
let is_dragging = false
let startX
let startY


document.getElementById("add_node").onclick = function add_node() {
    var randomColor = "#" + (Math.floor(Math.random()*16777215).toString(16));
    var x = Math.random()*(canvas.width-100)
    var y = Math.random()*(canvas.height-100)
    shapes.push({x:x, y:y, width:100, height:100, color:randomColor, nodes:[]})
    for (const i of matrix){
        i.push(0)
    }
    matrix.push(new Array(matrix[0].length).fill(0))
    console.log(matrix)
    draw_shapes()
}


document.getElementById("start").onclick = function start() {
    let start_node = document.querySelector("input[type='radio'][name='start']:checked").value;
    let finish_node = document.querySelector("input[type='radio'][name='finish']:checked").value;
    console.log(start_node+"_"+finish_node)

    let heuristic = []
    for (var i = 0; i < matrix.length; i++){
        let line = []
        for (var j = 0; j < matrix.length; j++){
            if (i == j) {
                line.push(0)
                continue
            }
            if (Math.abs(i-j) === 3 || Math.floor(i/3) === Math.floor(j/3)){
                line.push(Math.abs(Math.floor(i/3) - Math.floor(j/3) + i%3 - j%3)*2)
            }
            else{
                var a = Math.abs(Math.floor(i/3) - Math.floor(j/3))*2
                var b = Math.abs(i%3 - j%3)*2
                line.push(Math.sqrt(a**2 + b**2))
            }
        }
        heuristic.push(line)
    }

    console.log(matrix)
    console.log(heuristic)
    console.log(aStar(matrix, heuristic, start_node, finish_node))
}


const aStar = function (graph, heuristic, start, goal) {

    var path = []

    var distances = [];
    for (var i = 0; i < graph.length; i++) distances[i] = Number.MAX_VALUE;
    distances[start] = 0;

    var priorities = [];
    for (var i = 0; i < graph.length; i++) priorities[i] = Number.MAX_VALUE;
    priorities[start] = heuristic[start][goal];

    var visited = [];
    for (var i = 0; i < graph.length; i++) visited[i] = false;


    while (true) {

        let lowestPriority = Number.MAX_VALUE;
        let lowestPriorityIndex = -1;
        for (var i = 0; i < priorities.length; i++) {
            if (priorities[i] < lowestPriority && !visited[i]) {
                lowestPriority = priorities[i];
                lowestPriorityIndex = i;
            }
        }

        path.push(lowestPriorityIndex)

 
        if (lowestPriorityIndex === -1) {
            return -1;
        } else if (lowestPriorityIndex == goal) {
            console.log("Goal node found!");

            for (var i = path.length-2; i > 0; i--) {
                if (matrix[path[i+1]][path[i]] === 0) path[i] = ""
            }
            console.log(path)
            return distances[lowestPriorityIndex];
        }

        for (var i = 0; i < graph[lowestPriorityIndex].length; i++) {
            if (graph[lowestPriorityIndex][i] !== 0 && !visited[i]) {
                if (distances[lowestPriorityIndex] + graph[lowestPriorityIndex][i] < distances[i]) {
                    distances[i] = distances[lowestPriorityIndex] + graph[lowestPriorityIndex][i];
                    priorities[i] = distances[i] + heuristic[i][goal];
                }
            }
        }

        visited[lowestPriorityIndex] = true;
    }
}


document.getElementById("change").onclick = function change() {
    for (const [index, shape] of shapes.entries()) {
        let container = document.getElementById(`node_${index}`)
        let node_objects = container.querySelectorAll("input")
        shape.nodes = []

        node_objects.forEach(elem => {
            if (elem.checked){
                matrix[index][elem.value] = 1
                matrix[elem.value][index] = 1
                
                shape.nodes.push(Number(elem.value))
            } else {
                matrix[index][elem.value] = 0
                matrix[elem.value][index] = 0
            }
        })
    }
    console.log(matrix)
    draw_shapes()
}


shapes.push({x:20, y:30, width:100, height:100, color:'lightblue', nodes:[1]})
shapes.push({x:50, y:100, width:100, height:100, color:'lightgreen', nodes:[0]})

let is_mouse_in_shape = function(x, y, shape) {
    let shape_left = shape.x
    let shape_right = shape.x + shape.width
    let shape_top = shape.y
    let shape_bot = shape.y + shape.height

    return (x > shape_left && x < shape_right && y > shape_top && y < shape_bot)
}

let mouse_down = function(event) {
    event.preventDefault()
    startX = parseInt(event.clientX - offset_x)
    startY = parseInt(event.clientY - offset_y)

    let index = 0
    for (let shape of shapes){
        if (is_mouse_in_shape(startX, startY, shape)){
            cur_shape_index = index
            is_dragging = true
            return
        }
        index++
    }
}

let mouse_up = function(event) {
    if (!is_dragging){
        return
    }

    event.preventDefault()
    is_dragging = false
}

let mouse_out = function(event) {
    if (!is_dragging){
        return
    }

    event.preventDefault()
    is_dragging = false
}

let mouse_move = function(event){

    if (!is_dragging){
        return
    } else{
        event.preventDefault()
        let mouseX = parseInt(event.clientX - offset_x)
        let mouseY = parseInt(event.clientY - offset_y)

        let dx = mouseX - startX
        let dy = mouseY - startY
        
        let cur_shape = shapes[cur_shape_index]
        cur_shape.x += dx
        cur_shape.y += dy

        draw_shapes();

        startX = mouseX
        startY = mouseY

    }

}

canvas.onmousedown = mouse_down
canvas.onmouseup = mouse_up
canvas.onmouseout = mouse_out
canvas.onmousemove = mouse_move


let draw_line = function(shape_from, shape_to) {
    context.beginPath()
    context.moveTo(
        shape_from.x + shape_from.width/2,
        shape_from.y + shape_from.height/2
    )
    context.lineTo(
        shape_to.x + shape_to.width/2,
        shape_to.y + shape_to.height/2
    )
    context.closePath()
    context.lineWidth = 2
    context.strokeStyle = 'orange'
    context.lineCap = "round"
    context.stroke()
}


let draw_shapes = function() {
    context.clearRect(0, 0, canvas_width, canvas_height)
    nodes_body.innerHTML = ""
    for (const [index, shape] of shapes.entries()) {

        context.fillStyle = shape.color
        context.fillRect(shape.x, shape.y, shape.width, shape.height)

        context.font = '100% Arial'
        context.fillStyle = 'black'
        context.fillText(index, shape.x+5, shape.y+shape.height-5)

        const row = document.createElement('div')
        row.id = "node_"+index

        
        row.innerText += "Node "+index
        row.innerHTML += `<input type="radio" value="${index}" name="start">`
        row.innerHTML += `<input type="radio" value="${index}" name="finish">`
        row.innerHTML += `<button type="button" id="delete_${index}" style="background-color:red">X</button>`

        for (const node of shape.nodes) {
            draw_line(shapes[index], shapes[node])
        }
        

        for (const node of Array(shapes.length).keys()) {
            if (index === node){
                continue
            }
            row.innerHTML += `<label>
            <input type="checkbox" name="nodes" id="${index+"_"+node}" value="${node}"
            ${shape.nodes.includes(node)? "checked":""}/>
            ${node}</label>`
        }

        nodes_body.appendChild(row)
    }
    for (const [index, shape] of shapes.entries()) {
        let container = document.getElementById(`node_${index}`)

        let delete_btn = document.getElementById(`delete_${index}`)
        delete_btn.onclick = function delete_node() {
            shapes.splice(index, 1)     
            for (let node of shapes){
                node.nodes.splice(node.nodes.indexOf(index), 1)
            } 
            matrix.splice(index, 1)
            for (let elem of matrix){
                elem.splice(index, 1)
            }      
            draw_shapes()
        }
      

        let node_objects = container.querySelectorAll("input[type='checkbox']")
        node_objects.forEach(elem => {
            elem.onchange = function double_check() {
                let id = (this.id+'').split("_")
                document.getElementById(`${id[1]}_${id[0]}`).checked = this.checked               
            }
        })
    }

}

draw_shapes()