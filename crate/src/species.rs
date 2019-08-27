use super::utils::*;
use Cell;

// use Light;
use SandApi;
use EMPTY_CELL;
use WATER;

use std::cmp;
// use std::mem;
use wasm_bindgen::prelude::*;
// use web_sys::console;

#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Species {
    Air = 0,
    Glass = 1,
    Sand = 2,
    Water = 3,

    Algae = 4,
    Plant = 5,

    Zoop = 6,
    Shrimp = 7,

    Bacteria = 8,
    Nitrogen = 9,

    Waste = 10,
    Seed = 11,
    Stone = 12,
}

impl Species {
    pub fn update(&self, cell: Cell, api: SandApi) {
        match self {
            Species::Air => {}
            Species::Glass => {}

            Species::Water => update_water(cell, api),
            Species::Sand => update_sand(cell, api),
            Species::Stone => update_stone(cell, api),

            // Species::Anaerobic => {}
            Species::Bacteria => update_bacteria(cell, api),
            Species::Zoop => update_zoop(cell, api),
            Species::Waste => update_waste(cell, api),
            Species::Nitrogen => update_nitrogen(cell, api),
            Species::Algae => update_algae(cell, api),

            // Species::Dust => update_dust(cell, api),
            Species::Shrimp => update_shrimp(cell, api),
            Species::Plant => update_plant(cell, api),
            Species::Seed => update_seed(cell, api),
        }
    }
}

pub fn update_waste(cell: Cell, mut api: SandApi) {
    let dx = rand_dir_2();

    let nbr = api.get(0, 1);
    let dnbr = api.get(dx, 1);
    if nbr.species == Species::Air || nbr.species == Species::Water {
        api.set(0, 0, nbr);
        api.set(0, 1, cell);
    } else if dnbr.species == Species::Air || dnbr.species == Species::Water {
        api.set(0, 0, dnbr);
        api.set(dx, 1, cell);
    }
}
pub fn update_nitrogen(cell: Cell, mut api: SandApi) {
    let dx = rand_dir_2();

    let nbr = api.get(0, 1);

   if nbr.species == Species::Sand || nbr.species== Species::Plant {
        api.set(0, 0, WATER);
        api.set(
            0,
            1,
            Cell {
                energy: nbr.energy.saturating_add(50),
                ..nbr
            },
        );
        return
    }
    let dnbr = api.get(dx, 1);
    if nbr.species == Species::Air || nbr.species == Species::Water {
        api.set(0, 0, nbr);
        api.set(0, 1, cell);
    } else if dnbr.species == Species::Air || dnbr.species == Species::Water {
        api.set(0, 0, dnbr);
        api.set(dx, 1, cell);
    }


}


pub fn update_bacteria(cell: Cell, mut api: SandApi) {
    let (dx, dy) = rand_vec_8();

    let down = api.get(0, 1);
    let nbr = api.get(dx, 1);
    let sample = api.get(dx, dy);
    if cell.age > 250 {
        //TODO cause death
        api.set(0, 0, Cell::new(Species::Nitrogen));
        return;
    }

    if sample.species == Species::Waste {
        api.set(
            dx,
            dy,
            Cell {
                energy: cell.energy.saturating_add(50),
                ..cell
            },
        );
        api.set(0, 0, WATER);
    }
    if down.species == Species::Air {
        api.set(0, 0, EMPTY_CELL);
        api.set(0, 1, cell);
    } else if nbr.species == Species::Water {
        api.set(0, 0, nbr);
        api.set(dx, 1, cell);
    } else if nbr.species == Species::Air {
        api.set(0, 0, EMPTY_CELL);
        api.set(dx, 1, cell);
    }
}

pub fn update_sand(cell: Cell, mut api: SandApi) {
    let (dx, dy) = rand_vec_8();

    let down = api.get(0, 1);
    let dnbr = api.get(dx, 1);
    if down.species == Species::Air {
        api.set(0, 0, EMPTY_CELL);
        api.set(0, 1, cell);
        return;
    } else if dnbr.species == Species::Water {
        api.set(0, 0, dnbr);
        api.set(dx, 1, cell);
        return;
    } else if dnbr.species == Species::Air {
        api.set(0, 0, EMPTY_CELL);
        api.set(dx, 1, cell);
        return;
    }
    let energy = cell.energy;

    let nbr = api.get(dx, dy);

 
    if nbr.species == Species::Sand {
        //diffuse nutrients

        let shared_energy = (energy / 2) + (nbr.energy / 2);

        //higher is faster
        let diffusion_factor = 0.5;
        let diffusion_factor_c = 1.0 - diffusion_factor;

        let new_energy = (((energy as f32) * diffusion_factor_c)
            + ((shared_energy as f32) * diffusion_factor)) as u8;
        let new_nbr_energy = (((nbr.energy as f32) * diffusion_factor_c)
            + ((shared_energy as f32) * diffusion_factor)) as u8;

        let conservation = (nbr.energy + energy) - (new_nbr_energy + new_energy);

        api.set(
            dx,
            dy,
            Cell {
                energy: new_nbr_energy + conservation,
                ..nbr
            },
        );
        api.set(
            0,
            0,
            Cell {
                energy: new_energy,
                ..cell
            },
        );
    }

    // let dx = rand_dir_2();

    // let nbr = api.get(0, 1);
    // let dnbr = api.get(dx, 1);
    // if nbr.species == Species::Air || nbr.species == Species::Water {
    //     api.set(0, 0, nbr);
    //     api.set(0, 1, cell);
    // } else if dnbr.species == Species::Air || dnbr.species == Species::Water {
    //     api.set(0, 0, dnbr);
    //     api.set(dx, 1, cell);
    // }
}
pub fn update_water(cell: Cell, mut api: SandApi) {
    let dx = rand_dir();
    let below = api.get(0, 1);
    let dx1 = api.get(dx, 1);
    let dx1r = api.get(-dx, 1);
    let dx0 = api.get(dx, 0);
    let dx0r = api.get(-dx, 0);
    if below.species == Species::Air {
        api.set(0, 0, below);
        api.set(0, 1, cell);
    } else if dx0.species == Species::Air {
        api.set(0, 0, dx0);
        api.set(dx, 0, cell);
    } else if dx0r.species == Species::Air {
        api.set(0, 0, dx0r);
        api.set(-dx, 0, cell);
    } else if dx1.species == Species::Air {
        api.set(0, 0, dx1);
        api.set(dx, 1, cell);
    } else if dx1r.species == Species::Air {
        api.set(0, 0, dx1r);
        api.set(-dx, 1, cell);
    }
}

pub fn update_algae(cell: Cell, mut api: SandApi) {
    let down = api.get(0, 1);
    if down.species == Species::Air {
        api.set(0, 0, EMPTY_CELL);
        api.set(0, 1, cell);

        return;
    }
    let (dx, dy) = rand_vec();
    if rand_int(10) < 9 {
        return;
    }
    if cell.age > 30  { //old age
        api.set(0, 0, Cell::new(Species::Waste));
        return;
    }
    let nbr = api.get(dx, dy);
    if nbr.species == Species::Water && api.get(-dx, -dy).species != Species::Glass {
        let mut split_energy = 0;

        if cell.age > 10 && cell.energy > 80 {
            split_energy = cell.energy / 2;
            api.set(
                0,
                0,
                Cell {
                    energy: split_energy.saturating_sub(20), //cost of reproduction
                    age: 0,
                    ..cell
                },
            );
        }
        if split_energy == 0 {
            api.set(0, 0, nbr);
        }
        let mut photosynth: u8 = (api.get_light().sun / 5) ;
        if photosynth > 0 && !api.use_co2() {
            photosynth = 0; //need co2
        }

        api.set(
            dx,
            dy,
            Cell {
                energy: cell
                    .energy
                    .saturating_add(photosynth)
                    .saturating_sub(8) //cost of life
                    .saturating_sub(split_energy),
                age: cell.age.saturating_add(api.universe.generation),
                ..cell
            },
        );
    }
}

pub fn update_zoop(cell: Cell, mut api: SandApi) {
    let down = api.get(0, 1);
    if down.species == Species::Air {
        api.set(0, 0, EMPTY_CELL);
        api.set(0, 1, cell);

        return;
    }
    let (dx, dy) = rand_vec();
    if cell.age > 250 {
        api.set(0, 0, Cell::new(Species::Waste));
        return;
    }
    let nbr = api.get(dx, dy);
    if nbr.species == Species::Water {
        api.set(0, 0, nbr);
        api.set(
            dx,
            dy,
            Cell {
                energy: cell.energy,
                age: cell.age + api.universe.generation,
                ..cell
            },
        );
        if cell.age > 100 && api.use_oxygen() {
            api.set(
                0,
                0,
                Cell {
                    energy: cell.energy / 2,
                    age: 0,
                    ..cell
                },
            );
        }
    }
}

pub fn update_shrimp(cell: Cell, mut api: SandApi) {
    let down = api.get(0, 1);
    if down.species == Species::Air {
        api.set(0, 0, EMPTY_CELL);
        api.set(0, 1, cell);

        return;
    }
    let (dx, dy) = rand_vec();
    if cell.age > 250 {
        api.set(0, 0, Cell::new(Species::Waste));
        return;
    }
    let nbr = api.get(dx, dy);
    if nbr.species == Species::Water {
        api.set(0, 0, nbr);
        api.set(
            dx,
            dy,
            Cell {
                energy: cell.energy,
                age: cell.age + api.universe.generation,
                ..cell
            },
        );
        if api.use_oxygen() {
            api.set(
                0,
                0,
                Cell {
                    energy: cell.energy / 2,
                    age: 0,
                    ..cell
                },
            );
        }
    }
}

pub fn update_stone(cell: Cell, mut api: SandApi) {
    if api.get(-1, -1).species == Species::Stone && api.get(1, -1).species == Species::Stone {
        return;
    }

    let nbr = api.get(0, 1);
    let nbr_species = nbr.species;
    if nbr_species == Species::Air {
        api.set(0, 0, EMPTY_CELL);
        api.set(0, 1, cell);
    } else if nbr_species == Species::Water {
        api.set(0, 0, nbr);
        api.set(0, 1, cell);
    } else {
        api.set(0, 0, cell);
    }
}

pub fn update_plant(cell: Cell, mut api: SandApi) {
    let (dx, dy) = rand_vec_8();
    let energy = cell.energy;

    let light = api.get_light().sun;
    if energy > 100
        && rand_int(light as i32) > 200
        && (api.get(dx, -1).species == Species::Water
            && api.get(0, -1).species == Species::Water
            && api.get(-dx, -1).species == Species::Water
            && api.get(dx * 2, -1).species == Species::Water
            && api.use_co2())
    {
        // let i = rand_int(100);
        api.set(
            dx,
            -1,
            Cell {
                energy: 50,
                age: 0,
                ..cell
            },
        );
        api.set(
            0,
            0,
            Cell {
                energy: energy.saturating_sub(50),
                ..cell
            },
        );
        // api.set(-dx, dy, EMPTY_CELL);
    }

    let nbr = api.get(dx, dy);

    if nbr.species == Species::Plant || nbr.species == Species::Sand {
        //diffuse nutrients

        let shared_energy = (energy / 2) + (nbr.energy / 2);
        let cappilary_action = dy * -2;

        let new_energy = cmp::min(
            (((energy / 2) + (shared_energy / 2)) as i32).saturating_sub(cappilary_action),
            255,
        ) as u8;

        let new_nbr_energy = cmp::min(
            (((nbr.energy / 2) + (shared_energy / 2)) as i32).saturating_add(cappilary_action),
            255,
        ) as u8;

        let conservation = (nbr.energy + energy) - (new_nbr_energy + new_energy);

        api.set(
            dx,
            dy,
            Cell {
                energy: new_nbr_energy + conservation,
                ..nbr
            },
        );
        api.set(
            0,
            0,
            Cell {
                energy: new_energy,
                ..cell
            },
        );
    }
}

pub fn update_seed(cell: Cell, mut api: SandApi) {
    let age = cell.age;
    let energy = cell.energy;

    let (dx, dy) = rand_vec();

    let nbr_species = api.get(dx, dy).species;

    if age == 0 {
        //falling

        let dxf = rand_dir(); //falling dx
        let nbr_species_below = api.get(dxf, 1).species;
        if nbr_species_below == Species::Sand || nbr_species_below == Species::Plant {
            api.set(
                0,
                0,
                Cell {
                    age: (rand_int(253) + 1) as u8,
                    ..cell
                },
            );
            return;
        }

        let nbr = api.get(0, 1);
        if nbr.species == Species::Air {
            api.set(0, 0, EMPTY_CELL);
            api.set(0, 1, cell);
        } else if api.get(dxf, 1).species == Species::Air {
            api.set(0, 0, EMPTY_CELL);
            api.set(dxf, 1, cell);
        } else if nbr.species == Species::Water {
            api.set(0, 0, nbr);
            api.set(0, 1, cell);
        } else {
            api.set(0, 0, cell);
        }
    } else {
        if energy > 60 {
            //stem
            let dxr = rand_dir(); //raising dx
            if rand_int(100) > 75 {
                if (api.get(dxr, -1).species == Species::Air
                    || api.get(dxr, -1).species == Species::Sand
                    || api.get(dxr, -1).species == Species::Seed)
                    && api.get(1, -1).species != Species::Plant
                    && api.get(-1, -1).species != Species::Plant
                {
                    api.set(
                        dxr,
                        -1,
                        Cell {
                            energy: (energy as i32 - rand_int(10)) as u8,
                            ..cell
                        },
                    );
                    api.set(
                        0,
                        0,
                        Cell {
                            species: Species::Plant,
                            energy: 80 + (js_sys::Math::random() * 30.) as u8,
                            age: 0,
                            clock: 0,
                        },
                    )
                } else {
                    api.set(0, 0, WATER);
                }
            }
        } else {
            if nbr_species == Species::Water {
                api.set(dx, dy, Cell::new(Species::Seed))
            }
        }
    }
}

// pub fn update_mite(cell: Cell, mut api: SandApi) {
//     let mut i = rand_int(100);
//     let mut dx = 0;
//     if cell.ra < 20 {
//         dx = (cell.ra as i32) - 1;
//     }
//     let mut dy = 1;
//     let mut mite = cell.clone();

//     if cell.rb > 10 {
//         // /
//         mite.rb = mite.rb.saturating_sub(1);
//         dy = -1;
//     } else if cell.rb > 1 {
//         // \
//         mite.rb = mite.rb.saturating_sub(1);
//     } else {
//         // |
//         dx = 0;
//     }
//     let nbr = api.get(dx, dy);

//     let sx = (i % 3) - 1;
//     i = rand_int(1000);
//     let sy = (i % 3) - 1;
//     let sample = api.get(sx, sy).species;

//     if (sample == Species::Plant || sample == Species::Seed) && i > 800 {
//         api.set(0, 0, EMPTY_CELL);
//         api.set(sx, sy, cell);

//         return;
//     }

//     if nbr.species == Species::Air {
//         api.set(0, 0, EMPTY_CELL);
//         api.set(dx, dy, mite);
//     } else if dy == 1 && i > 800 {
//         i = rand_int(100);
//         let mut ndx = (i % 3) - 1;
//         if i < 6 {
//             //switch direction
//             ndx = dx;
//         }

//         mite.ra = (1 + ndx) as u8;
//         mite.rb = 10 + (i % 10) as u8; //hop height

//         api.set(0, 0, mite);
//     } else {
//         if api.get(-1, 0).species == Species::Mite
//             && api.get(1, 0).species == Species::Mite
//             && api.get(0, -1).species == Species::Mite
//         {
//             api.set(0, 0, EMPTY_CELL);
//         } else {
//             api.set(0, 0, mite);
//         }
//     }
// }
