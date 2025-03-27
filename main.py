from flask import Flask,redirect,url_for,render_template,request,flash,abort,session,send_file
from flask_session import Session
from key import secret_key,salt1,salt2
from itsdangerous import URLSafeTimedSerializer
from stoken import token
import os
from flask_mysqldb import MySQL
from mail import sendmail
from io import BytesIO
app = Flask(__name__) #creating flask app name
app.secret_key =secret_key
app.config['SESSION_TYPE']='filesystem'   
app.config['MYSQL_HOST']='localhost'
app.config['MYSQL_USER']='root'
app.config['MYSQL_PASSWORD']='admin'
app.config['MYSQL_DB']='rb'
Session(app)
mysql=MySQL(app)
@app.route('/')
def index():
    return render_template('indexrl.html')
@app.route('/register',methods=['GET','POST'])
def register():
    if request.method=='POST':
        name=request.form['name']
        email=request.form['email']
        password=request.form['password']
        gender=request.form['gender']
        cursor=mysql.connection.cursor()
        cursor.execute('select count(*) from register where name=%s',[name])
        count=cursor.fetchone()[0]
        cursor.execute('select count(*) from register where email=%s',[email])
        count1=cursor.fetchone()[0]
        cursor.close()
        if count==1:
            flash('username already in use')
            return render_template('register.html')
        elif count1==1:
            flash('Email already in use')
            return render_template('register.html')
        data={'name':name,'email':email,'password':password,'gender':gender}
        subject='Email Confirmation'
        body=f"Thanks for signing up\n\nfollow this link for further steps-{url_for('confirm',token=token(data,salt1),_external=True)}"
        sendmail(to=email,subject=subject,body=body)
        flash('Confirmation link sent to mail')
        return redirect(url_for('login'))
    return render_template('register.html')
@app.route('/login',methods=['GET','POST'])
def login():
    if request.method=='POST':
        print(request.form)
        name=request.form['name']
        password=request.form['password']
        cursor=mysql.connection.cursor()
        cursor.execute('SELECT count(*) from register where name=%s and password=%s',[name,password])
        count=cursor.fetchone()[0]
        if count==1:
            session['user']=name
            return redirect(url_for('home'))
            
        else:
            flash('Invalid username or password')
            return render_template('login.html')
    return render_template('login.html')

@app.route('/confirm/<token>')
def confirm(token):
    try:
        serializer=URLSafeTimedSerializer(secret_key)
        data=serializer.loads(token,salt=salt1,max_age=180)
    except Exception as e:
        abort (404,'Link Expired register again')
    else:
        cursor=mysql.connection.cursor()
        email=data['email']
        cursor.execute('select count(*) from register where email=%s',[email])
        count=cursor.fetchone()[0]
        if count==1:
            cursor.close()
            flash('You are already registerterd!')
            return redirect(url_for('login'))
        else:
            cursor.execute('insert into register values(%s,%s,%s,%s)',[data['name'],data['email'],data['password'],data['gender']])
            mysql.connection.commit()
            cursor.close()
            flash('Details registered!')
            return redirect(url_for('login'))


@app.route('/aforget',methods=['GET','POST'])
def aforgot():
    if request.method=='POST':
        id1=request.form['name']
        cursor=mysql.connection.cursor()
        cursor.execute('select count(*) from register where name=%s',[id1])
        count=cursor.fetchone()[0]
        cursor.close()
        if count==1:
            cursor=mysql.connection.cursor()

            cursor.execute('SELECT email  from register where name=%s',[id1])
            email=cursor.fetchone()[0]
            cursor.close()
            subject='Forget Password'
            confirm_link=url_for('areset',token=token(id1,salt=salt2),_external=True)
            body=f"Use this link to reset your password-\n\n{confirm_link}"
            sendmail(to=email,body=body,subject=subject)
            flash('Reset link sent check your email')
            return redirect(url_for('login'))
        else:
            flash('Invalid email id')
            return render_template('forgot.html')
    return render_template('forgot.html')


@app.route('/areset/<token>',methods=['GET','POST'])
def areset(token):
    try:
        serializer=URLSafeTimedSerializer(secret_key)
        id1=serializer.loads(token,salt=salt2,max_age=180)
    except:
        abort(404,'Link Expired')
    else:
        if request.method=='POST':
            newpassword=request.form['npassword']
            confirmpassword=request.form['cpassword']
            if newpassword==confirmpassword:
                cursor=mysql.connection.cursor()
                cursor.execute('update  register set password=%s where name=%s',[newpassword,id1])
                mysql.connection.commit()
                flash('Reset Successful')
                return redirect(url_for('login'))
            else:
                flash('Passwords mismatched')
                return render_template('newpassword.html')
        return render_template('newpassword.html')

@app.route('/logout')
def logout():
    if session.get('user'):
        session.pop('user')
        flash('Successfully logged out')
        return redirect(url_for('login'))
    else:
        return redirect(url_for('login'))

@app.route('/home')
def home():

    return render_template('index.html')
@app.route('/dummy')
def dummy():
    return render_template('dummy.html')
@app.route('/resume_1',methods=['GET','POST'])
def resume_1():

    if session.get('user'):
        if request.method=='POST':
            name=request.form['name']
            dob=request.form['dob']
            email=request.form['email']
            phone=request.form['phone']
            city=request.form['city']
            state=request.form['state']
            career=request.form['career']
            about=request.form['about']
            course=request.form['course']
            college=request.form['college']
            month=request.form['month']
            year=request.form['year']
            achiements=request.form['achiements']
            skills=request.form['skills']
            father=request.form['father']
            mother=request.form['mother']
            pa=request.form['pa']
            Declartion=request.form['Declaration']
            cursor=mysql.connection.cursor()
            cursor.execute('INSERT INTO resume_1(name,dob,email,phone,city,state,career,about,course,college,month,year,achiements,skills,father,mother,pa,Declaration) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)',[name,dob,email,phone,city,state,career,about,course,college,month,year,achiements,skills,father,mother,pa,Declartion]) 
            mysql.connection.commit()
            cursor.close()
            return redirect(url_for('available'))

    return render_template('resume_1.html')

@app.route('/resume_2',methods=['GET','POST'])
def resume_2():
    if session.get('user'):
        if request.method=='POST':
            name=request.form['name']
            dob=request.form['dob']
            email=request.form['email']
            phone=request.form['phone']
            city=request.form['city']
            state=request.form['state']
            career=request.form['career']
            about=request.form['about']
            course=request.form['course']
            college=request.form['college']
            month=request.form['month']
            year=request.form['year']
            achiements=request.form['achiements']
            skills=request.form['skills']
            father=request.form['father']
            mother=request.form['mother']
            pa=request.form['pa']
            Declaration=request.form['Declaration']
            cursor=mysql.connection.cursor()
            cursor.execute('INSERT INTO  resume_2(name,dob,email,phone,city,state,career,about,course,college,month,year,achiements,skills,father,mother,pa,Declaration) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)',[name,dob,email,phone,city,state,career,about,course,college,month,year,achiements,skills,father,mother,pa,Declaration]) 
            mysql.connection.commit()
            cursor.close()
            return redirect(url_for('available1'))
    return render_template('resume_2.html')

@app.route('/resume_template')
def resume_template():
    return render_template('resume_template.html')

@app.route('/available')
def available():
    if session.get('user'):       
        cursor=mysql.connection.cursor()
        cursor.execute('select * from resume_1')
        items=cursor.fetchall()
        return render_template('resume_1.html',items=items)
    else:
        return redirect(url_for('login'))

@app.route('/available1')
def available1():
    if session.get('user'):       
        cursor=mysql.connection.cursor()
        cursor.execute('select * from resume_2')
        items=cursor.fetchall()
        return render_template('resume_2.html',items=items)
    else:
        return redirect(url_for('login'))
@app.route('/last')
def last():
    if session.get('user'):       
        cursor=mysql.connection.cursor()
        cursor.execute('select * from resume_1 order by date desc')
        items=cursor.fetchone()
        return render_template('last.html',items=items)
    else:
        return redirect(url_for('login'))
@app.route('/last1')
def last1():
    if session.get('user'):       
        cursor=mysql.connection.cursor()
        cursor.execute('select * from resume_2 order by date desc')
        items=cursor.fetchone()
        return render_template('last1.html',items=items)
    else:
        return redirect(url_for('login'))

if(__name__ == "__main__"):
    app.run(debug=True,use_reloader=True)