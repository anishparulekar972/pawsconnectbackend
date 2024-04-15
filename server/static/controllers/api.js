
const mysql = require("mysql");
const express = require('express');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const checkAuth = require('../controllers/checkAuth');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const store_db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_API

  });

exports.storedb = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_API

  });


const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE

  });




let first = 2020;
let sec = 2022;
let okay = first + sec;
exports.num = okay;

exports.test = async (req, res) => {

  const ridematch ="share";
  const zipmatch ="97217";
  const gendermatch ="female";
  const food1 ="vegetarian";
  const food2 ="nonvegetarian";
  const okay = food1 + food2;
db.query('SELECT match_user FROM match_user WHERE ride=? AND my_zipcode=? AND my_gender=? AND my_food_type=?',[ridematch, zipmatch, gendermatch, food1], async(error, matchresults) => {

  if(error) {
      console.log(error);
  } else {
      console.log(matchresults);

      res.send(okay);

  }

} )
}












exports.posts = async (req, res) => {
    db.query('SELECT gender FROM maw_users WHERE email = ?', ['renukadingore1234@gmail.com'], async(error, results) => {
        if(error){
            console.log(error);
            console.log("error");
        } else{
            console.log("result");
            return res.render('posts', {
                gender: gender
            })
        }
    })
}

exports.register = async (req, res) => {
    const { username, name, email, password} = req.body;
    let hashedPassword = await bcrypt.hash(password, 8);
    db.query('INSERT INTO users SET ?', {username: username, name: name, email: email, password: hashedPassword}, async(error, results) => {
        if(error){
            console.log(error);
            console.log("error");
        } else{
            console.log("result");
            res.status(200).send("done!");
        }
    })
}


exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        db.query('SELECT * FROM users WHERE username = ?', [username], async (error, results) => {
            if (error) {
                console.error("Database error:", error);
                return res.status(500).send("Internal server error");
            }

            if (results.length === 0) {
                console.log("User not found");
                return res.status(404).send("User not found");
            }

            const user = results[0];
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                console.log("Invalid username or password");
                return res.status(401).send("Invalid username or password");
            }

            console.log("Login successful");
            // Return a success message or user data without generating JWT token or setting cookies
            return res.status(200).send("Login successful");
        });
    } catch (error) {
        console.error("Unexpected error:", error);
        return res.status(500).send("Internal server error");
    }
};











exports.createPost = async (req, res) => {
    const { postContent, visibility } = req.body;

    try {
        // Insert the post data into the database
        db.query('INSERT INTO posts (post_content, visibility) VALUES (?, ?)', [postContent, visibility], (error, results) => {
            if (error) {
                console.error('Error creating post:', error);
                return res.status(500).json({ error: 'Internal server error' });
            } else {
                console.log('New post created:', results);
                return res.status(200).json({ message: 'Post created successfully' });
            }
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};



exports.addPetProfile = async (req, res) => {
    const { petName, petType, petBreed } = req.body;
    try {
        db.query('INSERT INTO pet_profiles SET ?', { pet_name: petName, pet_type: petType, pet_breed: petBreed }, async (error, results) => {
            if (error) {
                console.error('Error inserting pet profile:', error);
                console.error("error");
                return res.status(500).send('Internal server error');
            } else {
                console.log("result");
                return res.status(200).send("done!");
            }
        });
    } catch (error) {
        console.error("Unexpected error:", error);
        return res.status(500).send('Internal server error');
    }
}



exports.removePetProfile = async (req, res) => {
    const { petName, petType, petBreed } = req.body; // Extract pet details from request body

    try {
        // Query to delete the pet profile from the database
        db.query('DELETE FROM pet_profiles WHERE pet_name = ? AND pet_type = ? AND pet_breed = ?', [petName, petType, petBreed], async (error, results) => {
            if (error) {
                console.error('Error deleting pet profile:', error);
                return res.status(500).send('Internal server error');
            } else {
                // Check if any rows were affected by the delete operation
                if (results.affectedRows > 0) {
                    // Pet profile successfully deleted
                    return res.status(200).send('Pet profile deleted successfully');
                } else {
                    // No matching pet profile found
                    return res.status(404).send('Pet profile not found');
                }
            }
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return res.status(500).send('Internal server error');
    }
}















/*
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        db.query('SELECT * FROM users WHERE username = ?', [username], async (error, results) => {
            if (error) {
                console.error("Database error:", error);
                return res.status(500).send("Internal server error");
            }

            if (results.length === 0) {
                console.log("User not found");
                return res.status(404).send("User not found");
            }

            const user = results[0];
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                console.log("Invalid username or password");
                return res.status(401).send("Invalid username or password");
            }

            const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN
            });

            console.log("Login successful");
            const cookieOptions = {
                expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
                httpOnly: true
            };

            res.cookie('jwt', token, cookieOptions);
            return res.status(200).send(token);
        });
    } catch (error) {
        console.error("Unexpected error:", error);
        return res.status(500).send("Internal server error");
    }
};


*/

























exports.join = (req, res) => {
    console.log(req.body);



    const {  username, email, password, gender, month, day, year, food_type, address, zipcode, country, state, occupation, about_me} = req.body;

   console.log(month);

    db.query('SELECT email FROM matw_users WHERE email = ?', [email], async (error, results) =>{
        if(error){
            console.log(error);

        }

        if(results.length > 0){
            return res.render('join',{
                message: 'Email is already in use'
            })
        }

      /*  else if( password == passwordConfirm ){
            return res.render('join',{
                message: 'Password do not match!'
            });
        }*/


        let hashedPassword = await bcrypt.hash(password, 8);
        console.log(hashedPassword);

        db.query('INSERT INTO matw_users SET ?', { username: username, email: email, password: hashedPassword, gender: gender, dob_mm: month, dob_dd: day, dob_yy: year, food_type: food_type, address: address, zipcode: zipcode, country: country, state: state, occupation: occupation, about: about_me }, (error, results) => {

            if(error) {
                console.log(error);
            } else {
                console.log(results);
                return res.render('sign_in', {
                    success_message: 'Sign in And You\'ll be ready to Mingle.'

                })
            }

        })

    });



}













/* Match Algorithm*/






