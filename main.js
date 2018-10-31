var string = '\
def bla(user, name, passord):\n\
\tif user == "Bateau":\n\
\t\tprint("Bateau")\n\
bla()\n\
bl_info = {\n\
\t"name": "Auto Bone Controller",\n\
\t"author": "Antonio Vazquez (antonioya)",\n\
\t"version": (1, 0, 12),\n\
\t"blender": (2, 7, 8),\n\
\t"location": "View3D > Properties",\n\
\t"description": "Add controllers for bendy bones automatically",\n\
\t"category": "3D View"}\n\
\n\
import bpy\n\
from mathutils import Vector\n\
def combobox_object_callback(scene, context):\n\
    items = []\n\
    i = 0\n\
    i += 1\n\
    items.append(("*NONE", "", "No custom shape", "OBJECT", i))\n\
    for obj in context.scene.objects:\n\
        if obj.type in (\"MESH\", \"EMPTY\"):\n\
            i += 1\n\
            items.append((obj.name, obj.name, "Select this object", "OBJECT", i))\n\
\n\
    return items\n\\n\
    def parent_armature(armature, parentobj, childobj):\n\
    for mybone in armature.edit_bones:\n\
        mybone.select = False\n\
\n\
    parent = armature.edit_bones[parentobj]\n\
    child = armature.edit_bones[childobj]\n\
    armature.edit_bones.active = parent\n\
\n\
    parent.select = True\n\\n\
    child.select = True\n\\n\
    bpy.ops.armature.parent_set(type=\"OFFSET\")\n\\n\
\n\
    class RunAction(bpy.types.Operator):\n\
    bl_idname = "bone.add_controller"\n\
    bl_label = "Add"\n\
    bl_description = "Create bone controllers"\n\
\n\
    @classmethod\n\
    def poll(cls, context):\n\
        if context.active_bone is None:\n\
            return False\n\
\n\
        return True\n\
\n\
    # ------------------------------\n\
    # Create bone groups (POSE mode)\n\
    # ------------------------------\n\
    # noinspection PyMethodMayBeStatic\n\
    def create_bone_groups(self, amt):\n\
        bpy.ops.object.mode_set(mode="POSE")\n\
        if "Grp_In" in bpy.data.objects[amt.name].pose.bone_groups:\n\
            grp_in = bpy.data.objects[amt.name].pose.bone_groups["Grp_In"]\n\
        else:\n\
            grp_in = bpy.data.objects[amt.name].pose.bone_groups.new("Grp_In")\n\
            grp_in.color_set = "THEME03"  # Green\n\
\n\
        if "Grp_Out" in bpy.data.objects[amt.name].pose.bone_groups:\n\
            grp_out = bpy.data.objects[amt.name].pose.bone_groups["Grp_Out"]\n\
        else:\n\
            grp_out = bpy.data.objects[amt.name].pose.bone_groups.new("Grp_Out")\n\
            grp_out.color_set = "THEME01"  # Red\n\
\n\
        bpy.ops.object.mode_set(mode="EDIT")\n\
\n\
        return grp_in, grp_out\n\
\n\
    # ------------------------------\n\
    # Set bone groups\n\
    # ------------------------------\n\
    # noinspection PyMethodMayBeStatic\n\
    def set_bone_group(self, amt, bone_name, grp):\n\
        bpy.data.objects[amt.name].pose.bones[bone_name].bone_group = grp\n\
\n\
    # ------------------------------\n\
    # Create bone controllers\n\
    # ------------------------------\n\
    # noinspection PyMethodMayBeStatic\n\
    def create_controllers(self, amt, main_bone, txt_a, txt_b, size_a, size_b, bx, bz, roll):\n\
        main_name = main_bone.name\n\
        tail = main_bone.tail\n\
        head = main_bone.head\n\
\n\
        v1 = Vector((head[0] - tail[0], head[1] - tail[1], head[2] - tail[2],))\n\
        v1.normalize()\n\
\n\
        # create controller A\n\
        bone_a = amt.edit_bones.new(main_name + txt_a)\n\
        bone_a.tail = head\n\
        bone_a.head = (head[0] + (v1[0] * size_a), head[1] + (v1[1] * size_a), head[2] + (v1[2] * size_a))\n\
        bone_a.bbone_x = bx * 1.15\n\
        bone_a.bbone_z = bz * 1.15\n\
        bone_a.roll = roll\n\
\n\
        # create controller B\n\
        bone_b = amt.edit_bones.new(main_name + txt_b)\n\
        bone_b.head = tail\n\
        bone_b.tail = (tail[0] + (v1[0] * -size_b), tail[1] + (v1[1] * -size_b), tail[2] + (v1[2] * -size_b))\n\
        bone_b.bbone_x = bx * 1.20\n\
        bone_b.bbone_z = bz * 1.20\n\
        bone_b.roll = roll\n\
\n\
    # ------------------------------\n\
    # Set custom shapes and segments\n\
    # ------------------------------\n\
    # noinspection PyMethodMayBeStatic\n\
    def set_custom_shapes(self, context, ob, main_bone, main_name, txt_a, txt_b):\n\
        scene = context.scene\n\
        # increase segments and set properties\n\
        if type(main_bone).__name__ != "EditBone":\n\
            bpy.ops.object.mode_set(mode="EDIT")\n\
\n\
        bpy.data.objects[ob.name].data.edit_bones[main_bone.name].bbone_segments = scene.auto_bone_subdivisions\n\
\n\
        # need set as object mode\n\
        bpy.ops.object.mode_set(mode="POSE")\n\
        bpy.ops.object.mode_set(mode="OBJECT")\n\
        b = ob.pose.bones[main_name]\n\
        b.use_bbone_custom_handles = True\n\
        b.bbone_custom_handle_start = bpy.data.objects[ob.name].pose.bones[main_name + txt_a]\n\
        b.bbone_custom_handle_end = bpy.data.objects[ob.name].pose.bones[main_name + txt_b]\n\
\n\
    # ------------------------------\n\
    # Set lock and deform\n\
    # ------------------------------\n\
    # noinspection PyMethodMayBeStatic\n\
    def set_lock_and_deform(self, context, main_name, ob, txt_a, txt_b):\n\
        scene = context.scene\n\
        bpy.ops.object.mode_set(mode="POSE")\n\
        ma = bpy.data.objects[ob.name].pose.bones[main_name]\n\
        # lock rot and scale\n\
        ma.lock_rotation[0] = True\n\
        ma.lock_rotation[1] = True\n\
        ma.lock_rotation[2] = True\n\
        if ma.rotation_mode == "QUATERNION":\n\
            ma.lock_rotation_w = True\n\
\n\
        ma.lock_location[0] = True\n\
        ma.lock_location[1] = True\n\
        ma.lock_location[2] = True\n\
\n\
        ba = bpy.data.objects[ob.name].pose.bones[main_name + txt_a]\n\
        bb = bpy.data.objects[ob.name].pose.bones[main_name + txt_b]\n\
        # disable deform\n\
        ob.data.bones[main_name + txt_a].use_deform = False\n\
        ob.data.bones[main_name + txt_b].use_deform = False\n\
\n\
        if scene.auto_bone_list_a != "*NONE":\n\
            ba.custom_shape = bpy.data.objects[scene.auto_bone_list_a]\n\
            ba.custom_shape_scale = scene.auto_bone_scale_a\n\
\n\
        if scene.auto_bone_list_b != "*NONE":\n\
            bb.custom_shape = bpy.data.objects[scene.auto_bone_list_b]\n\
            bb.custom_shape_scale = scene.auto_bone_scale_b\n\
\n\
    # ------------------------------\n\
    # Set constraintlock and deform\n\
    # ------------------------------\n\
    # noinspection PyMethodMayBeStatic\n\
    def set_constraint(self, context, main_name, ob, txt_b):\n\
        # flush modes to force recalc\n\
        bpy.ops.object.mode_set(mode="OBJECT")\n\
        bpy.ops.object.mode_set(mode=""DIT")\n\
        bpy.ops.object.mode_set(mode="POSE")\n\
        bpy.data.objects[ob.name].data.bones.active = bpy.data.objects[ob.name].pose.bones[main_name].bone\n\
        bpy.ops.pose.constraint_add(type="STRETCH_TO")\n\
        bpy.data.objects[ob.name].pose.bones[main_name].constraints[0].target = ob  # "Stretch To"\n\
        context.object.pose.bones[main_name].constraints[0].subtarget = main_name + txt_b\n\
\n\
    # ------------------------------\n\
    # Set bone controllers\n\
    # ------------------------------\n\
    # noinspection PyMethodMayBeStatic\n\
    def set_bone(self, context, ob, amt, main_bone, size_a, txt_a, size_b, txt_b):\n\
        scene = context.scene\n\
        oldmode = ob.mode\n\
\n\
        if oldmode != "EDIT":\n\
            bpy.ops.object.mode_set(mode="EDIT")\n\
\n\
        main_name = main_bone.name\n\
        # save main bone parent\n\
        if bpy.data.armatures[amt.name].edit_bones[main_name].parent is not None:\n\
            main_parent = bpy.data.armatures[amt.name].edit_bones[main_name].parent.name\n\
        else:\n\
            main_parent = ""\n\
        # get roll\n\
        roll = bpy.data.armatures[amt.name].edit_bones[main_name].roll\n\
\n\
        # get scale\n\
        bx = bpy.data.armatures[amt.name].edit_bones[main_name].bbone_x\n\
        bz = bpy.data.armatures[amt.name].edit_bones[main_name].bbone_z\n\
        # create groups\n\
        if scene.auto_bone_color is True:\n\
            grp_in, grp_out = self.create_bone_groups(amt)\n\
\n\
        # create controllers\n\
        self.create_controllers(amt, main_bone, txt_a, txt_b, size_a, size_b, bx, bz, roll)\n\
\n\
        # increase segments and set properties\n\
        self.set_custom_shapes(context, ob, main_bone, main_name, txt_a, txt_b)\n\
\n\
        # set lock and deform\n\
        self.set_lock_and_deform(context, main_name, ob, txt_a, txt_b)\n\
\n\
        # set constraint\n\
        self.set_constraint(context, main_name, ob, txt_b)\n\
\n\
        # back to edit mode (need a flush)\n\
        bpy.ops.object.mode_set(mode="OBJECT")\n\
        bpy.ops.object.mode_set(mode="EDIT")\n\
\n\
        # parent bone with controller A\n\
        parent_armature(amt, main_name + txt_a, main_name)\n\
\n\
        # if original bone was parented, parent controllers\n\
        if main_parent != "":\n\
            parent_armature(amt, main_parent, main_name + txt_a)\n\
            parent_armature(amt, main_parent, main_name + txt_b)\n\
\n\
        # set bone groups\n\
        if scene.auto_bone_color is True:\n\
            # noinspection PyUnboundLocalVariable\n\
            self.set_bone_group(amt, main_name + txt_a, grp_in)\n\
            # noinspection PyUnboundLocalVariable\n\
            self.set_bone_group(amt, main_name + txt_b, grp_out)\n\
\n\
        # back to original mode\n\
        bpy.ops.object.mode_set(mode=oldmode)\n\
\n\
        return {"FINISHED"}\n\
\n\
    # ------------------------------\n\
    # Execute\n\
    # ------------------------------\n\
    # noinspection PyMethodMayBeStatic\n\
    def execute(self, context):\n\
        scene = context.scene\n\
        size_a = scene.auto_bone_size_a\n\
        txt_a = scene.auto_bone_txt_a\n\
        size_b = scene.auto_bone_size_b\n\
        txt_b = scene.auto_bone_txt_b\n\
\n\
        ob = context.object\n\
        # retry armature\n\
        amt = ob.data\n\
        # save the list of selected bones because the selection is missing when parent\n\
        selbones = []\n\
        if context.mode == "EDIT_ARMATURE":\n\
            for bone in context.selected_bones:\n\
                selbones.extend([bone])\n\
\n\
        if context.mode == "POSE":\n\
            for bone in context.selected_pose_bones:\n\
                selbones.extend([bone])\n\
\n\
        # Loop\n\
        for main_bone in selbones:\n\
            self.set_bone(context, ob, amt, main_bone, size_a, txt_a, size_b, txt_b)\n\
\n\
        return {"FINISHED"}\n\
'
var i = 0;
function hack(){
    i++
    i++
    i++
    document.getElementById("hacking_zone").innerText = string.substr(0,i)
    $("pre code").each(function(i, block) {
        hljs.highlightBlock(block);
      });
}
function yo() {
}
